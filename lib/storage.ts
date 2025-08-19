import { PERF_OPTIMIZATIONS_ENABLED, buildNamespacedKey } from '@/lib/config/perf';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface StorageSetOptions {
  ttl?: number; // milliseconds
}

interface StoredPayload<T> {
  v: number; // schema version
  t: number; // timestamp (ms)
  e?: number; // expiry timestamp (ms)
  d: T; // data
}

const SCHEMA_VERSION = 1;

let inMemoryFallback = new Map<string, string>();

function getSafeStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function setItem<T extends JsonValue>(key: string, value: T, options?: StorageSetOptions) {
  if (!PERF_OPTIMIZATIONS_ENABLED) return; // no-op behind flag for safety
  const namespaced = buildNamespacedKey(key);
  const payload: StoredPayload<T> = {
    v: SCHEMA_VERSION,
    t: Date.now(),
    e: options?.ttl ? Date.now() + options.ttl : undefined,
    d: value,
  };
  const serialized = JSON.stringify(payload);
  const storage = getSafeStorage();
  try {
    if (storage) storage.setItem(namespaced, serialized);
    else inMemoryFallback.set(namespaced, serialized);
  } catch {
    // Quota exceeded or other; fallback to memory
    inMemoryFallback.set(namespaced, serialized);
  }
}

export function getItem<T extends JsonValue>(key: string): T | null {
  const namespaced = buildNamespacedKey(key);
  const storage = getSafeStorage();
  let raw: string | null = null;
  try {
    raw = storage ? storage.getItem(namespaced) : inMemoryFallback.get(namespaced) ?? null;
  } catch {
    raw = inMemoryFallback.get(namespaced) ?? null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredPayload<T>;
    if (parsed.v !== SCHEMA_VERSION) {
      removeItem(key);
      return null;
    }
    if (parsed.e && parsed.e < Date.now()) {
      removeItem(key);
      return null;
    }
    return parsed.d;
  } catch {
    removeItem(key);
    return null;
  }
}

export function removeItem(key: string) {
  const namespaced = buildNamespacedKey(key);
  const storage = getSafeStorage();
  try {
    if (storage) storage.removeItem(namespaced);
  } finally {
    inMemoryFallback.delete(namespaced);
  }
}

export function cleanupStorage() {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    const prefix = buildNamespacedKey('');
    const keysToDelete: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (!k) continue;
      // Remove previous namespaces or corrupted entries
      if (!k.startsWith(prefix)) keysToDelete.push(k);
      else {
        try {
          const raw = storage.getItem(k);
          if (!raw) continue;
          const parsed = JSON.parse(raw) as StoredPayload<JsonValue>;
          if ((parsed.e && parsed.e < Date.now()) || typeof parsed.v !== 'number') {
            keysToDelete.push(k);
          }
        } catch {
          keysToDelete.push(k);
        }
      }
    }
    keysToDelete.forEach((k) => storage.removeItem(k));
  } catch {
    // Ignore cleanup errors
  }
}


