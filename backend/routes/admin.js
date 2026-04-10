const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ─── In-memory live exam tracking (ephemeral — not persisted to DB) ───────────
const activeExams = new Map();

// ─── PUBLIC: Student Exam Ping ────────────────────────────────────────────────
router.post('/api/student/exam/ping', (req, res) => {
  const { name, roll, studentClass, section, progress, status, timeRemaining } = req.body;

  if (!name || !roll || !studentClass) return res.status(400).json({ error: 'missing parameters' });

  // Include name in key to allow multiple students with the same roll
  const key = `${name}-${roll}-${studentClass}-${section || 'A'}`;

  if (status === 'Submitted') {
    activeExams.delete(key);
    return res.json({ success: true });
  }

  activeExams.set(key, {
    name: String(name),
    roll: String(roll),
    studentClass: String(studentClass),
    section: String(section || 'A'),
    progress: progress || '0%',
    status: status || 'In Progress',
    timeRemaining,
    lastActive: Date.now()
  });

  res.json({ success: true });
});

// ─── ADMIN: Login ─────────────────────────────────────────────────────────────
router.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'admin-token-123' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// ─── ADMIN: Dashboard Stats ──────────────────────────────────────────────────
router.get('/api/admin/dashboard-stats', requireAdmin, (req, res) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM results').get().count;
    const avgRow = db.prepare('SELECT AVG(percentage) as avg FROM results').get();
    const averageScore = avgRow.avg ? Math.round(avgRow.avg) : 0;

    // Count questions per class
    const q6 = db.prepare("SELECT COUNT(*) as count FROM questions WHERE class = '6'").get().count;
    const q7 = db.prepare("SELECT COUNT(*) as count FROM questions WHERE class = '7'").get().count;
    const q8 = db.prepare("SELECT COUNT(*) as count FROM questions WHERE class = '8'").get().count;

    res.json({
      totalStudents,
      averageScore,
      questionsCount: { '6': q6, '7': q7, '8': q8 }
    });
  } catch (err) {
    console.error('[Admin] Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ─── ADMIN: Live Monitor ─────────────────────────────────────────────────────
router.get('/api/admin/live-monitor', requireAdmin, (req, res) => {
  try {
    const now = Date.now();
    const activeList = [];

    for (const [key, data] of activeExams.entries()) {
      if (now - data.lastActive > 35000) {
        activeExams.delete(key);
      } else {
        activeList.push(data);
      }
    }

    res.json(activeList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get live monitor' });
  }
});

module.exports = router;
