const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ─── ADMIN: Get All Sessions ──────────────────────────────────────────────────
router.get('/api/admin/sessions', requireAdmin, (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY date DESC').all();
    res.json(sessions);
  } catch (err) {
    console.error('[Sessions] Fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// ─── ADMIN: Create Session ────────────────────────────────────────────────────
router.post('/api/admin/sessions', requireAdmin, (req, res) => {
  try {
    const { name, class: targetClass, section, duration, date, status } = req.body;

    if (!name || !targetClass) {
      return res.status(400).json({ error: 'Name and class are required' });
    }

    const id = crypto.randomUUID();
    const sec = section || 'ALL';
    const dur = Number(duration) || 30;
    const st = status || 'ACTIVE';

    db.prepare(
      'INSERT INTO sessions (id, name, class, section, duration, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name, targetClass, sec, dur, date, st);

    const newSession = { id, name, class: targetClass, section: sec, duration: dur, date, status: st };
    res.status(201).json(newSession);
  } catch (err) {
    console.error('[Sessions] Create error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ─── ADMIN: Delete Session ────────────────────────────────────────────────────
router.delete('/api/admin/sessions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM sessions WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Sessions] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ─── PUBLIC: Verify Active Session for Student ────────────────────────────────
router.post('/api/student/verify-session', (req, res) => {
  try {
    const { studentClass, section } = req.body;
    if (!studentClass) return res.status(400).json({ error: 'Class is required' });

    const sec = section || 'A';

    // A session matches if class matches AND (section is ALL OR section matches)
    const active = db.prepare(
      `SELECT id, duration FROM sessions 
       WHERE status = 'ACTIVE' AND class = ? 
       AND (section = 'ALL' OR section = ?)`
    ).get(String(studentClass), sec);

    if (active) {
      res.json({ success: true, duration: active.duration });
    } else {
      res.status(403).json({
        error: `No active exam session is currently running for Class ${studentClass} Section ${sec}. Please wait for the administrator to start the session.`
      });
    }
  } catch (err) {
    console.error('[Sessions] Verify error:', err);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

module.exports = router;
