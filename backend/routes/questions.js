const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ─── PUBLIC: Get Questions for a Class ────────────────────────────────────────
router.get('/api/questions', (req, res) => {
  const studentClass = req.query.class;

  if (!studentClass) {
    return res.status(400).json({ error: 'Invalid or missing class' });
  }

  try {
    const rows = db.prepare('SELECT * FROM questions WHERE class = ?').all(studentClass);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No questions found for this class' });
    }

    // Parse options JSON and map to frontend shape
    const questions = rows.map(r => ({
      id: r.id,
      question: r.question,
      options: JSON.parse(r.options),
      correct: r.correct
    }));

    res.json(questions);
  } catch (err) {
    console.error('[Questions] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// ─── ADMIN: Get Questions by Class ────────────────────────────────────────────
router.get('/api/admin/questions/:class', requireAdmin, (req, res) => {
  try {
    const classId = req.params.class;
    const rows = db.prepare('SELECT * FROM questions WHERE class = ?').all(classId);

    const questions = rows.map(r => ({
      id: r.id,
      question: r.question,
      options: JSON.parse(r.options),
      correct: r.correct
    }));

    res.json(questions);
  } catch (err) {
    console.error('[Questions] Admin fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// ─── ADMIN: Add Question ──────────────────────────────────────────────────────
router.post('/api/admin/questions', requireAdmin, (req, res) => {
  try {
    const { studentClass, questionText, options, correctIndex } = req.body;

    if (!studentClass || !questionText || !options || options.length !== 4 || typeof correctIndex !== 'number') {
      return res.status(400).json({ error: 'Invalid question data' });
    }

    const id = crypto.randomUUID();

    db.prepare(
      'INSERT INTO questions (id, class, question, options, correct) VALUES (?, ?, ?, ?, ?)'
    ).run(id, studentClass, questionText, JSON.stringify(options), correctIndex);

    res.status(201).json({ id, question: questionText, options, correct: correctIndex });
  } catch (err) {
    console.error('[Questions] Add error:', err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// ─── ADMIN: Update Question ───────────────────────────────────────────────────
router.put('/api/admin/questions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { studentClass, questionText, options, correctIndex } = req.body;

    const info = db.prepare(
      'UPDATE questions SET class = ?, question = ?, options = ?, correct = ? WHERE id = ?'
    ).run(studentClass, questionText, JSON.stringify(options), correctIndex, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ id, question: questionText, options, correct: correctIndex });
  } catch (err) {
    console.error('[Questions] Update error:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// ─── ADMIN: Delete Question ───────────────────────────────────────────────────
router.delete('/api/admin/questions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const info = db.prepare('DELETE FROM questions WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Questions] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ─── ADMIN: Bulk Delete Questions ─────────────────────────────────────────────
router.post('/api/admin/questions/bulk-delete', requireAdmin, (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No question IDs provided' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const info = db.prepare(`DELETE FROM questions WHERE id IN (${placeholders})`).run(...ids);

    res.json({ success: true, deletedCount: info.changes });
  } catch (err) {
    console.error('[Questions] Bulk delete error:', err);
    res.status(500).json({ error: 'Failed to delete questions' });
  }
});

module.exports = router;
