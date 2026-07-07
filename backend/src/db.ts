import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'property.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      area REAL,
      building_count INTEGER DEFAULT 0,
      unit_count INTEGER DEFAULT 0,
      contact_phone TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      community_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      floors INTEGER NOT NULL DEFAULT 1,
      units_per_floor INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_id INTEGER NOT NULL,
      unit_number TEXT NOT NULL,
      floor INTEGER NOT NULL,
      area REAL NOT NULL,
      type TEXT NOT NULL DEFAULT '住宅',
      status TEXT NOT NULL DEFAULT '空置',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      id_card TEXT,
      type TEXT NOT NULL DEFAULT '业主',
      move_in_date TEXT,
      status TEXT NOT NULL DEFAULT '在住',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS fee_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT '元/月',
      description TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER NOT NULL,
      fee_type_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '未缴',
      due_date TEXT,
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
      FOREIGN KEY (fee_type_id) REFERENCES fee_types(id)
    );

    CREATE TABLE IF NOT EXISTS repair_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER,
      resident_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT '其他',
      priority TEXT NOT NULL DEFAULT '普通',
      status TEXT NOT NULL DEFAULT '待处理',
      handler TEXT,
      result TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT,
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '通知',
      author TEXT,
      is_pinned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS parking_spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      community_id INTEGER NOT NULL,
      space_number TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '地上',
      status TEXT NOT NULL DEFAULT '空闲',
      unit_id INTEGER,
      monthly_fee REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
    );
  `);
}

export default db;
