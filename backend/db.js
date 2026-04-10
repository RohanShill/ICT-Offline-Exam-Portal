const Database = require('better-sqlite3');
const path = require('path');

// Database file path — configurable for Electron
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'exam.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency (multiple students submitting)
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

// ─── Table Creation ───────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    roll TEXT NOT NULL,
    class TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'A',
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    percentage REAL NOT NULL,
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    class TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'ALL',
    duration INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Insert default settings if missing
const defaultSettings = [
  { key: 'showAnswers', value: 'false' },
  { key: 'schoolName', value: 'ICT Exam Portal' },
  { key: 'udiseCode', value: '' }
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
db.transaction((settings) => {
  for (const setting of settings) {
    insertSetting.run(setting.key, setting.value);
  }
})(defaultSettings);

console.log('[DB] SQLite database initialized at', DB_PATH);

module.exports = db;
