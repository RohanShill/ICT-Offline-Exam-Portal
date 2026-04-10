const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ─── PUBLIC: Submit Exam ──────────────────────────────────────────────────────
router.post('/api/submit', (req, res) => {
  const { name, roll, studentClass, section, score, total, percentage, date } = req.body;

  if (!name || !roll || !studentClass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sec = section || 'A';
    const submittedAt = date || new Date().toISOString();

    const stmt = db.prepare(
      `INSERT INTO results (name, roll, class, section, score, total, percentage, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const info = stmt.run(
      String(name),
      String(roll),
      String(studentClass),
      sec,
      Number(score),
      Number(total),
      Number(percentage),
      submittedAt
    );

    res.status(200).json({ success: true, message: 'Exam submitted successfully', id: info.lastInsertRowid });
  } catch (err) {
    console.error('[Results] Submit error:', err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// ─── PUBLIC: Get Results ──────────────────────────────────────────────────────
router.get('/api/results', (req, res) => {
  try {
    const results = db.prepare('SELECT * FROM results ORDER BY submitted_at DESC').all();
    // Map to match frontend expected shape
    const mapped = results.map(r => ({
      id: r.id,
      name: r.name,
      roll: r.roll,
      class: r.class,
      section: r.section,
      score: r.score,
      total: r.total,
      percentage: r.percentage,
      date: r.submitted_at
    }));
    res.json(mapped);
  } catch (err) {
    console.error('[Results] Fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve results' });
  }
});

// ─── ADMIN: Get Results ───────────────────────────────────────────────────────
router.get('/api/admin/results', requireAdmin, (req, res) => {
  try {
    const results = db.prepare('SELECT * FROM results ORDER BY submitted_at DESC').all();
    const mapped = results.map(r => ({
      id: r.id,
      name: r.name,
      roll: r.roll,
      class: r.class,
      section: r.section,
      score: r.score,
      total: r.total,
      percentage: r.percentage,
      date: r.submitted_at
    }));
    res.json(mapped);
  } catch (err) {
    console.error('[Results] Admin fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve results' });
  }
});

// ─── ADMIN: Bulk Delete Results ───────────────────────────────────────────────
router.post('/api/admin/results/bulk-delete', requireAdmin, (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const info = db.prepare(`DELETE FROM results WHERE id IN (${placeholders})`).run(...ids);

    res.json({ success: true, deletedCount: info.changes });
  } catch (err) {
    console.error('[Results] Bulk delete error:', err);
    res.status(500).json({ error: 'Failed to bulk delete results' });
  }
});

// ─── ADMIN: Delete Result by ID ───────────────────────────────────────────────
router.delete('/api/admin/results/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM results WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Results] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

// ─── ADMIN: Edit Student Name by ID ───────────────────────────────────────────
router.put('/api/admin/results/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || !newName.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const info = db.prepare('UPDATE results SET name = ? WHERE id = ?').run(newName.trim(), id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Results] Edit name error:', err);
    res.status(500).json({ error: 'Failed to edit name' });
  }
});

module.exports = router;
