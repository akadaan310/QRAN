/**
 * Kept places and the silent return (§9 "kept places & silent return").
 *
 * Local-only, additive, wordless: an ayah is kept or released by gesture and
 * comes back as its own text, never as a label. The Phase-1 IndexedDB
 * (`interstellar-quran-phase1`, four stores) is left exactly as it was — this
 * is a second, additive database rather than a version bump that would
 * rewrite the schema the Phase-1 modules still read.
 *
 * Every call degrades to a no-op when IndexedDB is unavailable (private
 * windows, blocked site data): the reader loses memory between sessions, not
 * the ability to read.
 */

const DB_NAME = "qran-sacred";
const DB_VERSION = 1;
const KEPT = "kept";
const PLACE = "place";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("no indexedDB"));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEPT)) db.createObjectStore(KEPT, { keyPath: "key" });
      if (!db.objectStoreNames.contains(PLACE)) db.createObjectStore(PLACE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = fn(db.transaction(store, mode).objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export interface KeptAyah {
  key: number;
  surah: number;
  ayah: number;
  at: number;
}

export interface Place {
  id: "last";
  page: number;
  surah: number;
  ayah: number;
  at: number;
}

export const keep = {
  async list(): Promise<KeptAyah[]> {
    try {
      const rows = await run<KeptAyah[]>(KEPT, "readonly", (s) => s.getAll() as IDBRequest<KeptAyah[]>);
      return rows.sort((a, b) => b.at - a.at);
    } catch {
      return [];
    }
  },

  async has(key: number): Promise<boolean> {
    try {
      return Boolean(await run<KeptAyah | undefined>(KEPT, "readonly", (s) => s.get(key) as IDBRequest<KeptAyah | undefined>));
    } catch {
      return false;
    }
  },

  /** Keep or release; returns the state the ayah ended up in. */
  async toggle(surah: number, ayah: number): Promise<boolean> {
    const key = surah * 1000 + ayah;
    try {
      if (await this.has(key)) {
        await run(KEPT, "readwrite", (s) => s.delete(key));
        return false;
      }
      await run(KEPT, "readwrite", (s) => s.put({ key, surah, ayah, at: Date.now() }));
      return true;
    } catch {
      return false;
    }
  },

  async remember(page: number, surah: number, ayah: number): Promise<void> {
    try {
      await run(PLACE, "readwrite", (s) => s.put({ id: "last", page, surah, ayah, at: Date.now() }));
    } catch {
      /* the reader simply starts at the beginning next time */
    }
  },

  async recall(): Promise<Place | null> {
    try {
      return (await run<Place | undefined>(PLACE, "readonly", (s) => s.get("last") as IDBRequest<Place | undefined>)) ?? null;
    } catch {
      return null;
    }
  },
};
