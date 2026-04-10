/**
 * Migration Script: JSON → SQLite
 * 
 * Reads existing JSON files and inserts data into SQLite database.
 * Safe to run multiple times — skips duplicates.
 * 
 * Usage: node backend/migrate.js
 */

const path = require('path');
const fs = require('fs');
const db = require('./db');

console.log('═══════════════════════════════════════════════');
console.log('  ICT Exam Portal — JSON to SQLite Migration');
console.log('═══════════════════════════════════════════════\n');

// ─── Helper: Safe JSON read ──────────────────────────────────────────────────
function readJSON(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] ${filename} not found`);
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`  [ERROR] Failed to parse ${filename}:`, err.message);
    return null;
  }
}

// ─── 1. Migrate Results ──────────────────────────────────────────────────────
console.log('1. Migrating results...');
const results = readJSON('result.json');
if (results && Array.isArray(results)) {
  const insertResult = db.prepare(
    `INSERT OR IGNORE INTO results (name, roll, class, section, score, total, percentage, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const migrateResults = db.transaction((items) => {
    let count = 0;
    for (const r of items) {
      try {
        insertResult.run(
          r.name || 'Unknown',
          String(r.roll || ''),
          String(r.class || ''),
          r.section || 'A',
          Number(r.score || 0),
          Number(r.total || 0),
          Number(r.percentage || 0),
          r.date || new Date().toISOString()
        );
        count++;
      } catch (err) {
        console.log(`    [SKIP] Duplicate or error for roll ${r.roll}: ${err.message}`);
      }
    }
    return count;
  });

  const migrated = migrateResults(results);
  console.log(`  ✓ Migrated ${migrated} results\n`);
} else {
  console.log('  [SKIP] No results to migrate\n');
}

// ─── 2. Migrate Questions ────────────────────────────────────────────────────
console.log('2. Migrating questions...');
const questions = readJSON('questions.json');
if (questions && typeof questions === 'object') {
  const insertQuestion = db.prepare(
    `INSERT OR IGNORE INTO questions (id, class, question, options, correct)
     VALUES (?, ?, ?, ?, ?)`
  );

  const migrateQuestions = db.transaction((data) => {
    let count = 0;
    for (const [classId, classQuestions] of Object.entries(data)) {
      if (!Array.isArray(classQuestions)) continue;
      for (const q of classQuestions) {
        try {
          insertQuestion.run(
            q.id,
            classId,
            q.question,
            JSON.stringify(q.options),
            q.correct
          );
          count++;
        } catch (err) {
          console.log(`    [SKIP] Duplicate question ${q.id}: ${err.message}`);
        }
      }
    }
    return count;
  });

  const migrated = migrateQuestions(questions);
  console.log(`  ✓ Migrated ${migrated} questions\n`);
} else {
  console.log('  [SKIP] No questions to migrate\n');
}

// ─── 3. Migrate Sessions ────────────────────────────────────────────────────
console.log('3. Migrating sessions...');
const sessions = readJSON('sessions.json');
if (sessions && Array.isArray(sessions)) {
  const insertSession = db.prepare(
    `INSERT OR IGNORE INTO sessions (id, name, class, section, duration, date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const migrateSessions = db.transaction((items) => {
    let count = 0;
    for (const s of items) {
      try {
        insertSession.run(
          s.id,
          s.name || 'Unnamed',
          String(s.class || ''),
          s.section || 'ALL',
          Number(s.duration || 30),
          s.date || '',
          s.status || 'ACTIVE'
        );
        count++;
      } catch (err) {
        console.log(`    [SKIP] Duplicate session ${s.id}: ${err.message}`);
      }
    }
    return count;
  });

  const migrated = migrateSessions(sessions);
  console.log(`  ✓ Migrated ${migrated} sessions\n`);
} else {
  console.log('  [SKIP] No sessions to migrate\n');
}

// ─── 4. Migrate Settings ────────────────────────────────────────────────────
console.log('4. Migrating settings...');
const settings = readJSON('settings.json');
if (settings && typeof settings === 'object') {
  const upsertSetting = db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`
  );

  const migrateSettings = db.transaction((data) => {
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      upsertSetting.run(key, String(value), String(value));
      count++;
    }
    return count;
  });

  const migrated = migrateSettings(settings);
  console.log(`  ✓ Migrated ${migrated} settings\n`);
} else {
  console.log('  [SKIP] No settings to migrate\n');
}

// ─── Done ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════');
console.log('  Migration complete!');
console.log('  Database: ' + path.join(__dirname, 'exam.db'));
console.log('  Original JSON files preserved as backups.');
console.log('═══════════════════════════════════════════════');

// Close the database connection
db.close();
