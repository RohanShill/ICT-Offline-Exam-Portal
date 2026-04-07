const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');
content = content.replace("const resultsPath = path.join(__dirname, 'result.json');", "const resultsPath = path.join(__dirname, 'result.json');\nconst sessionsPath = path.join(__dirname, 'sessions.json');\nif (!fs.existsSync(sessionsPath)) { fs.writeFileSync(sessionsPath, JSON.stringify([])); }");

content = content.replace("// Serve static frontend files", `
// 8. GET Exam Sessions
app.get('/api/admin/sessions', requireAdmin, (req, res) => {
  try {
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    res.json(sessions);
  } catch (err) { res.status(500).json({ error: 'Failed to retrieve sessions' }); }
});

// 9. POST Exam Sessions
app.post('/api/admin/sessions', requireAdmin, (req, res) => {
  try {
    const { name, class: targetClass, duration, date, status } = req.body;
    const crypto = require('crypto');
    const newSession = { id: crypto.randomUUID(), name, class: targetClass, duration: Number(duration), date, status: status || 'ACTIVE' };
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    sessions.push(newSession);
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
    res.status(201).json(newSession);
  } catch (err) { res.status(500).json({ error: 'Failed to create session' }); }
});

// 10. DELETE Exam Session
app.delete('/api/admin/sessions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    let sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    sessions = sessions.filter(s => s.id !== id);
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete' }); }
});

// Serve static frontend files`);

fs.writeFileSync('backend/server.js', content);
console.log('updated server.js');
