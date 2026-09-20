import type { Checkpoint, Discovery, NavigationStateRecord, PageSessionRecord } from "./types";

/**
 * Local-only persistence per product-spec/05. No server, no network — the
 * "Universal State Synchronization Engine" described there is a *future*
 * multi-device sync layer (product-spec/06 stage 5, explicitly excluded
 * from Phase 1); this class implements only its local half: the on-device
 * operation log a sync engine would later ship, honoring the same merge
 * rules a local-only IndexedDB is capable of proving.
 *
 * - Discoveries and checkpoints are additive and write immediately.
 * - NavigationState writes are debounced (~800ms of stillness).
 * - A discovery is never edited in place; a correction is a new discovery
 *   with `supersedes` set (product-spec/05 §Entities).
 */

const DB_NAME = "interstellar-quran-phase1";
const DB_VERSION = 1;
const STORES = {
  discoveries: "discoveries",
  checkpoints: "checkpoints",
  navigationState: "navigationState",
  pageSessions: "pageSessions",
} as const;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.discoveries)) {
        db.createObjectStore(STORES.discoveries, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.checkpoints)) {
        db.createObjectStore(STORES.checkpoints, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.navigationState)) {
        db.createObjectStore(STORES.navigationState, { keyPath: "deviceId" });
      }
      if (!db.objectStoreNames.contains(STORES.pageSessions)) {
        db.createObjectStore(STORES.pageSessions, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deviceId(): string {
  const KEY = "iq-device-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem(KEY, id); } catch { /* private mode: fall back to in-memory id for this session */ }
  }
  return id;
}

export class Persistence {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private navDebounce: number | null = null;
  readonly deviceId = deviceId();

  private db(): Promise<IDBDatabase> {
    if (!this.dbPromise) this.dbPromise = openDb();
    return this.dbPromise;
  }

  // -- Discoveries: additive, immediate write --
  async addDiscovery(d: Omit<Discovery, "id" | "createdAt">): Promise<Discovery> {
    const record: Discovery = { ...d, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    try {
      const db = await this.db();
      await tx(db, STORES.discoveries, "readwrite", (s) => s.put(record));
    } catch {
      // Offline posture: the reader's write is never held hostage by
      // storage failing. It is acknowledged locally; nothing is lost
      // in-session, only across a reload — documented, not silent.
    }
    return record;
  }

  async listDiscoveries(pageId: string): Promise<Discovery[]> {
    try {
      const db = await this.db();
      const all = await tx<Discovery[]>(db, STORES.discoveries, "readonly", (s) => s.getAll() as unknown as IDBRequest<Discovery[]>);
      return all.filter((d) => d.pageId === pageId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch {
      return [];
    }
  }

  // -- Checkpoints: additive, immediate write, first-class like native ones --
  async addCheckpoint(c: Omit<Checkpoint, "id" | "createdAt">): Promise<Checkpoint> {
    const record: Checkpoint = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    try {
      const db = await this.db();
      await tx(db, STORES.checkpoints, "readwrite", (s) => s.put(record));
    } catch { /* see addDiscovery */ }
    return record;
  }

  async listCheckpoints(pageId: string): Promise<Checkpoint[]> {
    try {
      const db = await this.db();
      const all = await tx<Checkpoint[]>(db, STORES.checkpoints, "readonly", (s) => s.getAll() as unknown as IDBRequest<Checkpoint[]>);
      return all.filter((c) => c.pageId === pageId);
    } catch {
      return [];
    }
  }

  // -- NavigationState: debounced, last-writer-wins per field (single-device here) --
  saveNavigationState(record: Omit<NavigationStateRecord, "deviceId" | "updatedAt">): void {
    if (this.navDebounce !== null) window.clearTimeout(this.navDebounce);
    this.navDebounce = window.setTimeout(async () => {
      const full: NavigationStateRecord = { ...record, deviceId: this.deviceId, updatedAt: new Date().toISOString() };
      try {
        const db = await this.db();
        await tx(db, STORES.navigationState, "readwrite", (s) => s.put(full));
      } catch { /* nav state is derivable; a lost debounced write just means a cold start re-derives defaults */ }
    }, 800);
  }

  async loadNavigationState(): Promise<NavigationStateRecord | null> {
    try {
      const db = await this.db();
      const rec = await tx<NavigationStateRecord | undefined>(db, STORES.navigationState, "readonly", (s) => s.get(this.deviceId));
      return rec ?? null;
    } catch {
      return null;
    }
  }

  // -- PageSession: one record per reading session, reader's own reflection only --
  async startSession(pageId: string, track: PageSessionRecord["track"]): Promise<PageSessionRecord> {
    const record: PageSessionRecord = {
      id: crypto.randomUUID(),
      pageId,
      track,
      startedAt: new Date().toISOString(),
      endedAt: null,
      deepestLensSpeed: 0,
      locksEncountered: 0,
      locksResolved: 0,
      discoveriesCount: 0,
    };
    try {
      const db = await this.db();
      await tx(db, STORES.pageSessions, "readwrite", (s) => s.put(record));
    } catch { /* session analytics are best-effort */ }
    return record;
  }

  async updateSession(id: string, patch: Partial<PageSessionRecord>): Promise<void> {
    try {
      const db = await this.db();
      const existing = await tx<PageSessionRecord | undefined>(db, STORES.pageSessions, "readonly", (s) => s.get(id));
      if (!existing) return;
      await tx(db, STORES.pageSessions, "readwrite", (s) => s.put({ ...existing, ...patch }));
    } catch { /* best-effort */ }
  }
}
