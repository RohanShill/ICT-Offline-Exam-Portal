const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize database (creates tables on first run)
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Mount Route Modules ──────────────────────────────────────────────────────
app.use(require('./routes/admin'));
app.use(require('./routes/results'));
app.use(require('./routes/questions'));
app.use(require('./routes/sessions'));
app.use(require('./routes/settings'));

// ─── Serve Static Frontend (Production) ───────────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all for React client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).send('Frontend build not found. Run: npm run build');
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Server] Accessible on LAN via http://<your-ip>:${PORT}`);
});
