/* global chrome */

(function (global) {
  const USE_SYNC_KEY = '__useSyncStorage';
  const SYNC_TOTAL_QUOTA_BYTES = 102400; // 100 KB
  const SYNC_ITEM_QUOTA_BYTES = 8192; // 8 KB per item
  const SYNC_MAX_WRITES_PER_MIN = 10;
  const SYNC_WRITE_WINDOW_MS = 60 * 1000;

  const syncArea = chrome?.storage?.sync || null;
  const localArea = chrome?.storage?.local || null;
  const syncMethods = syncArea
    ? {
        get: syncArea.get.bind(syncArea),
        set: syncArea.set.bind(syncArea),
        remove: syncArea.remove.bind(syncArea),
        clear: syncArea.clear.bind(syncArea),
        getBytesInUse: syncArea.getBytesInUse.bind(syncArea)
      }
    : {};
  const localMethods = localArea
    ? {
        get: localArea.get.bind(localArea),
        set: localArea.set.bind(localArea),
        remove: localArea.remove.bind(localArea),
        clear: localArea.clear.bind(localArea),
        getBytesInUse: localArea.getBytesInUse ? localArea.getBytesInUse.bind(localArea) : () => Promise.resolve(0)
      }
    : {};

  const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const writeHistory = [];
  const fallbackListeners = new Set();

  let syncAvailabilityChecked = false;
  let syncAvailable = false;
  let lastSyncError = null;

  function now() {
    return Date.now();
  }

  function pruneWriteHistory() {
    const cutoff = now() - SYNC_WRITE_WINDOW_MS;
    while (writeHistory.length && writeHistory[0] < cutoff) {
      writeHistory.shift();
    }
  }

  function recordWrite() {
    pruneWriteHistory();
    writeHistory.push(now());
  }

  function encodeBytes(value) {
    if (!textEncoder) {
      return JSON.stringify(value ?? null).length;
    }
    return textEncoder.encode(JSON.stringify(value ?? null)).length;
  }

  function notifyFallback(reason) {
    fallbackListeners.forEach((listener) => {
      try {
        listener(reason);
      } catch (error) {
        console.warn('StorageManager listener error', error);
      }
    });
  }

  async function ensureSyncAvailable() {
    if (syncAvailabilityChecked) {
      return syncAvailable;
    }

    if (!syncMethods.get) {
      syncAvailabilityChecked = true;
      syncAvailable = false;
      lastSyncError = new Error('chrome.storage.sync API is unavailable.');
      return false;
    }

    try {
      await syncMethods.get(null);
      syncAvailable = true;
      lastSyncError = null;
    } catch (error) {
      syncAvailable = false;
      lastSyncError = error;
    } finally {
      syncAvailabilityChecked = true;
    }

    if (!syncAvailable) {
      notifyFallback({ type: 'sync-unavailable', error: lastSyncError });
    }

    return syncAvailable;
  }

  async function getSyncPreference() {
    try {
      if (!localMethods.get) {
        return false;
      }
      const result = await localMethods.get([USE_SYNC_KEY]);
      const value = result[USE_SYNC_KEY];
      if (typeof value === 'undefined') {
        return true;
      }
      return Boolean(value);
    } catch (error) {
      console.warn('StorageManager: Failed to read sync preference, defaulting to false.', error);
      return false;
    }
  }

  async function setSyncPreference(enabled) {
    if (!localMethods.set) {
      throw new Error('chrome.storage.local API is unavailable.');
    }
    await localMethods.set({ [USE_SYNC_KEY]: Boolean(enabled) });
  }

  async function resolveArea(options = {}) {
    const preferSync = options.forceSync ?? (await getSyncPreference());
    if (preferSync && (await ensureSyncAvailable()) && syncArea) {
      return syncArea;
    }
    return localArea;
  }

  async function checkWriteQuota(items) {
    pruneWriteHistory();
    if (writeHistory.length >= SYNC_MAX_WRITES_PER_MIN) {
      const error = new Error('chrome.storage.sync write limit exceeded (10 writes/minute).');
      error.code = 'SYNC_WRITE_LIMIT';
      throw error;
    }

    const keys = Object.keys(items || {});
    for (const key of keys) {
      const bytes = encodeBytes(items[key]);
      if (bytes > SYNC_ITEM_QUOTA_BYTES) {
        const error = new Error(`Item "${key}" exceeds chrome.storage.sync per-item quota (8KB).`);
        error.code = 'SYNC_ITEM_QUOTA';
        throw error;
      }
    }

    const existing = syncMethods.get ? await syncMethods.get(keys) : {};
    let delta = 0;
    for (const key of keys) {
      const newBytes = encodeBytes(items[key]);
      const oldBytes = key in existing ? encodeBytes(existing[key]) : 0;
      delta += newBytes - oldBytes;
    }

    const currentBytes = syncMethods.getBytesInUse ? await syncMethods.getBytesInUse(null) : 0;
    if (currentBytes + delta > SYNC_TOTAL_QUOTA_BYTES) {
      const error = new Error('chrome.storage.sync total quota exceeded (100KB).');
      error.code = 'SYNC_TOTAL_QUOTA';
      throw error;
    }
  }

  async function migrateData(toSync) {
    const targetIsSync = Boolean(toSync);
    const fromMethods = targetIsSync ? localMethods : syncMethods;
    const toMethods = targetIsSync ? syncMethods : localMethods;

    try {
      if (!fromMethods.get || !toMethods.set || !toMethods.clear) {
        throw new Error('Required storage APIs are unavailable for migration.');
      }

      const data = await fromMethods.get(null);
      if (targetIsSync) {
        delete data[USE_SYNC_KEY];
      }

      if (targetIsSync) {
        await checkWriteQuota(data);
      }

      await toMethods.clear();
      if (Object.keys(data).length) {
        if (targetIsSync) {
          recordWrite();
        }
        await toMethods.set(data);
      }

      await setSyncPreference(targetIsSync);
      return { success: true };
    } catch (error) {
      console.error('StorageManager: Migration failed, falling back to local storage.', error);
      await setSyncPreference(false);
      notifyFallback({ type: 'migration-failed', error });
      return { success: false, error };
    }
  }

  async function performOperation(method, payload, options = {}) {
    const area = await resolveArea(options);
    const usingSync = area === syncArea;
    const methods = usingSync ? syncMethods : localMethods;

    if (usingSync && (method === 'set' || method === 'remove' || method === 'clear')) {
      if (method === 'set') {
        await checkWriteQuota(payload);
      } else {
        pruneWriteHistory();
      }
    }

    try {
      if (!methods[method]) {
        throw new Error(`Storage method ${method} is unavailable.`);
      }

      const args = method === 'clear' ? [] : [payload];
      const result = await methods[method](...args);
      if (usingSync && method === 'set') {
        recordWrite();
      }
      return result;
    } catch (error) {
      if (usingSync) {
        lastSyncError = error;
        console.warn(`StorageManager: Sync ${method} failed, falling back to local storage.`, error);
        notifyFallback({ type: 'sync-error', error });
        await setSyncPreference(false);
        const fallbackMethod = localMethods[method];
        if (!fallbackMethod) {
          throw error;
        }
        const args = method === 'clear' ? [] : [payload];
        return fallbackMethod(...args);
      }
      throw error;
    }
  }

  const StorageManager = {
    USE_SYNC_KEY,
    async isSyncPreferred() {
      return getSyncPreference();
    },
    async isSyncAvailable() {
      return ensureSyncAvailable();
    },
    getLastSyncError() {
      return lastSyncError;
    },
    async setSyncEnabled(enabled, options = { migrate: true }) {
      if (enabled) {
        const available = await ensureSyncAvailable();
        if (!available) {
          const error = lastSyncError || new Error('chrome.storage.sync is not available.');
          notifyFallback({ type: 'sync-unavailable', error });
          throw error;
        }
      }

      if (!options?.migrate) {
        await setSyncPreference(Boolean(enabled));
        return { success: true, migrated: false };
      }

      const result = await migrateData(Boolean(enabled));
      if (!result.success) {
        throw result.error;
      }
      return { success: true, migrated: true };
    },
    async get(keys, options) {
      return performOperation('get', keys, options);
    },
    async set(items, options) {
      return performOperation('set', items, options);
    },
    async remove(keys, options) {
      return performOperation('remove', keys, options);
    },
    async clear(options) {
      return performOperation('clear', null, options);
    },
    async getBytesInUse(keys, options) {
      const area = await resolveArea(options);
      const usingSync = area === syncArea;
      const methods = usingSync ? syncMethods : localMethods;
      if (!methods.getBytesInUse) {
        return 0;
      }
      return methods.getBytesInUse(keys ?? null);
    },
    subscribe(listener) {
      if (typeof listener === 'function') {
        fallbackListeners.add(listener);
        return () => fallbackListeners.delete(listener);
      }
      return () => {};
    }
  };

  if (syncArea) {
    const overrideMethod = (method, expectsValue) => {
      const original = syncMethods[method];
      if (typeof original !== 'function') {
        return;
      }

      chrome.storage.sync[method] = function (...args) {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const payload = args[0];
        const options = args.length > 1 ? args[1] : undefined;

        let promise;
        switch (method) {
          case 'get':
            promise = StorageManager.get(payload, options);
            break;
          case 'set':
            promise = StorageManager.set(payload, options);
            break;
          case 'remove':
            promise = StorageManager.remove(payload, options);
            break;
          case 'clear':
            promise = StorageManager.clear(options);
            break;
          case 'getBytesInUse':
            promise = StorageManager.getBytesInUse(payload, options);
            break;
          default:
            promise = original(...args);
        }

        if (callback) {
          promise
            .then((value) => {
              if (expectsValue) {
                callback(value);
              } else {
                callback();
              }
            })
            .catch((error) => {
              console.error(`StorageManager override ${method} error`, error);
              if (expectsValue) {
                callback({});
              } else {
                callback();
              }
            });
          return undefined;
        }

        return promise;
      };
    };

    overrideMethod('get', true);
    overrideMethod('set', false);
    overrideMethod('remove', false);
    overrideMethod('clear', false);
    overrideMethod('getBytesInUse', true);
  }

  global.StorageManager = StorageManager;
})(typeof self !== 'undefined' ? self : window);
