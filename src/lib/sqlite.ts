// Browser-side SQLite persistence using sql.js.
// The DB binary is stored in IndexedDB, making the project portable:
// users can export the .sqlite file with downloadDb() and re-import later.

import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type {
  Balances,
  ExperimentKey,
  ExperimentParams,
  ExperimentStats,
  FrictionEntry,
  LedgerEvent,
} from "./lab-store";

export type Preset = {
  id: string;
  experiment: ExperimentKey;
  name: string;
  params: ExperimentParams;
  createdAt: string;
};

const IDB_NAME = "betraylab";
const IDB_STORE = "kv";
const IDB_KEY = "db.sqlite";

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<Uint8Array | undefined> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result as Uint8Array | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function createSchema(d: Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS balances (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      deposited REAL, bonus REAL, visual REAL,
      withdrawable REAL, blocked REAL, fractional REAL
    );
    CREATE TABLE IF NOT EXISTS experiments (
      key TEXT PRIMARY KEY,
      params_json TEXT NOT NULL,
      stats_json TEXT NOT NULL,
      active_preset_id TEXT
    );
    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      experiment TEXT NOT NULL,
      name TEXT NOT NULL,
      params_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT, type TEXT, amount REAL,
      before_balance REAL, after_balance REAL,
      source TEXT, target TEXT, timestamp TEXT,
      note TEXT, experiment TEXT
    );
    CREATE TABLE IF NOT EXISTS frictions (
      id TEXT PRIMARY KEY, timestamp TEXT, message TEXT
    );
  `);
}

export async function initDb(): Promise<Database> {
  if (db) return db;
  SQL = await initSqlJs({ locateFile: () => wasmUrl });
  try {
    const bytes = await idbGet(IDB_KEY);
    db = bytes ? new SQL.Database(bytes) : new SQL.Database();
  } catch {
    db = new SQL.Database();
  }
  createSchema(db);
  return db;
}

export function scheduleSave() {
  if (!db) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (!db) return;
    try {
      const data = db.export();
      await idbSet(IDB_KEY, data);
    } catch (e) {
      console.warn("[sqlite] save failed", e);
    }
  }, 300);
}

export function downloadDb(filename = "bet-ray-lab.sqlite") {
  if (!db) return;
  const blob = new Blob([db.export() as BlobPart], { type: "application/x-sqlite3" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function importDb(file: File): Promise<void> {
  const buf = new Uint8Array(await file.arrayBuffer());
  await idbSet(IDB_KEY, buf);
  db = null;
  await initDb();
}

// ---------- Snapshot reads ----------

export type LoadedState = {
  balances?: Balances;
  experiments: Partial<
    Record<ExperimentKey, { params: ExperimentParams; stats: ExperimentStats; activePresetId: string | null }>
  >;
  presets: Preset[];
  events: LedgerEvent[];
  frictions: FrictionEntry[];
};

export async function loadSnapshot(): Promise<LoadedState> {
  const d = await initDb();
  const out: LoadedState = { experiments: {}, presets: [], events: [], frictions: [] };

  const bRes = d.exec("SELECT * FROM balances WHERE id = 1");
  if (bRes[0]?.values.length) {
    const r = bRes[0].values[0] as (number | string | null)[];
    const cols = bRes[0].columns;
    const obj: Record<string, number> = {};
    cols.forEach((c, i) => (obj[c] = Number(r[i] ?? 0)));
    out.balances = {
      deposited: obj.deposited,
      bonus: obj.bonus,
      visual: obj.visual,
      withdrawable: obj.withdrawable,
      blocked: obj.blocked,
      fractional: obj.fractional,
    };
  }

  const eRes = d.exec("SELECT key, params_json, stats_json, active_preset_id FROM experiments");
  if (eRes[0]) {
    for (const row of eRes[0].values) {
      const [key, params, stats, active] = row as [string, string, string, string | null];
      out.experiments[key as ExperimentKey] = {
        params: JSON.parse(params),
        stats: JSON.parse(stats),
        activePresetId: active ?? null,
      };
    }
  }

  const pRes = d.exec(
    "SELECT id, experiment, name, params_json, created_at FROM presets ORDER BY created_at DESC",
  );
  if (pRes[0]) {
    out.presets = pRes[0].values.map((r) => {
      const [id, experiment, name, params, createdAt] = r as [string, string, string, string, string];
      return {
        id,
        experiment: experiment as ExperimentKey,
        name,
        params: JSON.parse(params),
        createdAt,
      };
    });
  }

  const evRes = d.exec(
    "SELECT id, user_id, type, amount, before_balance, after_balance, source, target, timestamp, note, experiment FROM events ORDER BY timestamp DESC LIMIT 400",
  );
  if (evRes[0]) {
    out.events = evRes[0].values.map((r) => {
      const [id, userId, type, amount, before, after, source, target, ts, note, exp] = r as [
        string, string, string, number, number, number, string, string, string, string, string | null,
      ];
      return {
        id, userId, type: type as LedgerEvent["type"], amount,
        beforeBalance: before, afterBalance: after,
        source, target, timestamp: ts, note,
        experiment: (exp ?? undefined) as ExperimentKey | undefined,
      };
    });
  }

  const fRes = d.exec("SELECT id, timestamp, message FROM frictions ORDER BY timestamp DESC LIMIT 200");
  if (fRes[0]) {
    out.frictions = fRes[0].values.map((r) => {
      const [id, ts, msg] = r as [string, string, string];
      return { id, timestamp: ts, message: msg };
    });
  }

  return out;
}

// ---------- Snapshot writes ----------

export function persistBalances(b: Balances) {
  if (!db) return;
  db.run(
    `INSERT INTO balances (id, deposited, bonus, visual, withdrawable, blocked, fractional)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       deposited=excluded.deposited, bonus=excluded.bonus, visual=excluded.visual,
       withdrawable=excluded.withdrawable, blocked=excluded.blocked, fractional=excluded.fractional`,
    [b.deposited, b.bonus, b.visual, b.withdrawable, b.blocked, b.fractional],
  );
  scheduleSave();
}

export function persistExperiment(
  key: ExperimentKey,
  params: ExperimentParams,
  stats: ExperimentStats,
  activePresetId: string | null,
) {
  if (!db) return;
  db.run(
    `INSERT INTO experiments (key, params_json, stats_json, active_preset_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       params_json=excluded.params_json,
       stats_json=excluded.stats_json,
       active_preset_id=excluded.active_preset_id`,
    [key, JSON.stringify(params), JSON.stringify(stats), activePresetId],
  );
  scheduleSave();
}

export function persistEvent(e: LedgerEvent) {
  if (!db) return;
  db.run(
    `INSERT OR REPLACE INTO events (id, user_id, type, amount, before_balance, after_balance, source, target, timestamp, note, experiment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      e.id, e.userId, e.type, e.amount,
      e.beforeBalance, e.afterBalance,
      e.source, e.target, e.timestamp, e.note,
      e.experiment ?? null,
    ],
  );
  // Trim
  db.run("DELETE FROM events WHERE id NOT IN (SELECT id FROM events ORDER BY timestamp DESC LIMIT 400)");
  scheduleSave();
}

export function persistFriction(f: FrictionEntry) {
  if (!db) return;
  db.run("INSERT OR REPLACE INTO frictions (id, timestamp, message) VALUES (?, ?, ?)", [
    f.id, f.timestamp, f.message,
  ]);
  db.run("DELETE FROM frictions WHERE id NOT IN (SELECT id FROM frictions ORDER BY timestamp DESC LIMIT 200)");
  scheduleSave();
}

export function persistPreset(p: Preset) {
  if (!db) return;
  db.run(
    `INSERT OR REPLACE INTO presets (id, experiment, name, params_json, created_at) VALUES (?, ?, ?, ?, ?)`,
    [p.id, p.experiment, p.name, JSON.stringify(p.params), p.createdAt],
  );
  scheduleSave();
}

export function deletePresetRow(id: string) {
  if (!db) return;
  db.run("DELETE FROM presets WHERE id = ?", [id]);
  scheduleSave();
}

export function clearAll() {
  if (!db) return;
  db.exec(`
    DELETE FROM balances;
    DELETE FROM experiments;
    DELETE FROM events;
    DELETE FROM frictions;
  `);
  scheduleSave();
}
