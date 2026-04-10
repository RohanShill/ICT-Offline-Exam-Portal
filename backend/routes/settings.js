const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ─── PUBLIC: Get Settings ─────────────────────────────────────────────────────
router.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(row => {
      // Parse booleans and numbers
      if (row.value === 'true') settings[row.key] = true;
      else if (row.value === 'false') settings[row.key] = false;
      else if (!isNaN(row.value)) settings[row.key] = Number(row.value);
      else settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error('[Settings] Fetch error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// ─── ADMIN: Update Settings ───────────────────────────────────────────────────
router.post('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const newSettings = req.body;

    const upsert = db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
    );

    const transaction = db.transaction((settings) => {
      for (const [key, value] of Object.entries(settings)) {
        const strValue = String(value);
        upsert.run(key, strValue, strValue);
      }
    });

    transaction(newSettings);
    res.json({ success: true });
  } catch (err) {
    console.error('[Settings] Update error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
