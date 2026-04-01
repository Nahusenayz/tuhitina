import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db: Database.Database | null = null;

export function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'tihtina.db');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  createTables();

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

function createTables() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      room_number TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT,
      status TEXT NOT NULL DEFAULT 'checked_in',
      created_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      guest_id TEXT NOT NULL,
      pillow_type TEXT,
      dietary_restrictions TEXT,
      spa_preference TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS housekeeping_tasks (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      room_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'dirty',
      assigned_to TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS pricing_history (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      base_price_usd REAL NOT NULL,
      exchange_rate REAL NOT NULL,
      demand_multiplier REAL NOT NULL DEFAULT 1.0,
      final_price_etb REAL NOT NULL,
      occupancy_rate REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS license_activations (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL UNIQUE,
      activation_key TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_guests_property_id ON guests(property_id);
    CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
    CREATE INDEX IF NOT EXISTS idx_housekeeping_property_id ON housekeeping_tasks(property_id);
    CREATE INDEX IF NOT EXISTS idx_housekeeping_status ON housekeeping_tasks(status);
  `);
}
