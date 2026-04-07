const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Path to results file
const resultsPath = path.join(__dirname, 'result.json');
const sessionsPath = path.join(__dirname, 'sessions.json');
const settingsPath = path.join(__dirname, 'settings.json');
if (!fs.existsSync(settingsPath)) { fs.writeFileSync(settingsPath, JSON.stringify({ showAnswers: false })); }
if (!fs.existsSync(sessionsPath)) { fs.writeFileSync(sessionsPath, JSON.stringify([])); }

// Ensure result.json exists
if (!fs.existsSync(resultsPath)) {
  fs.writeFileSync(resultsPath, JSON.stringify([]));
}

// API Routes
// Live tracking memory store
const activeExams = new Map();

app.post('/api/student/exam/ping', (req, res) => {
  const { name, roll, studentClass, progress, status, timeRemaining } = req.body;
  
  if (!roll || !studentClass) return res.status(400).json({error: 'missing parameters'});
  
  const key = `${roll}-${studentClass}`;
  
  // If exam just finished (status submitted), we can optionally clear them immediately
  if (status === 'Submitted') {
      activeExams.delete(key);
      return res.json({ success: true });
  }

  activeExams.set(key, {
    name: String(name),
    roll: String(roll),
    studentClass: String(studentClass),
    progress: progress || '0%',
    status: status || 'In Progress',
    timeRemaining,
    lastActive: Date.now()
  });
  
  res.json({ success: true });
});

// Student Session Verification
app.post('/api/student/verify-session', (req, res) => {
  try {
    const { studentClass } = req.body;
    if (!studentClass) return res.status(400).json({ error: 'Class is required' });

    const sessionsPath = path.join(__dirname, 'sessions.json');
    const sessions = fs.existsSync(sessionsPath) ? JSON.parse(fs.readFileSync(sessionsPath, 'utf8')) : [];
    
    const isActive = sessions.some(s => s.status === 'ACTIVE' && String(s.class) === String(studentClass));

    if (isActive) {
      res.json({ success: true });
    } else {
      res.status(403).json({ error: `No active exam session is currently running for Class ${studentClass}. Please wait for the administrator to start the session.` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Settings API
app.get('/api/settings', (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    res.json(settings);
  } catch (err) { res.status(500).json({ error: 'Failed to load settings' }); }
});
app.get('/api/questions', (req, res) => {
  const studentClass = req.query.class;
  const questionsPath = path.join(__dirname, 'questions.json');
  let questions = {};

  try {
    if (fs.existsSync(questionsPath)) {
      questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading questions:', err);
  }

  if (!studentClass || !questions[studentClass]) {
    return res.status(400).json({ error: 'Invalid or missing class' });
  }

  res.json(questions[studentClass]);
});

app.post('/api/submit', (req, res) => {
  const { name, roll, studentClass, score, total, percentage, date } = req.body;

  if (!name || !roll || !studentClass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const rawData = fs.readFileSync(resultsPath, 'utf8');
    const results = JSON.parse(rawData);

    // Prevent duplicate submission for same roll in same session
    // Now checks if the date is within the same day to allow future exams
    const today = new Date().toISOString().split('T')[0];
    const existing = results.find(r => {
      const isSameDay = r.date && r.date.startsWith(today);
      return r.roll === String(roll) && r.class === String(studentClass) && isSameDay;
    });
    if (existing) {
      return res.status(403).json({ error: 'Student has already submitted the exam for this class today.' });
    }

    const newResult = {
      name: String(name),
      roll: String(roll),
      class: String(studentClass),
      score: Number(score),
      total: Number(total),
      percentage: Number(percentage),
      date: String(date)
    };

    results.push(newResult);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    res.status(200).json({ success: true, message: 'Exam submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

app.get('/api/results', (req, res) => {
  // Now potentially protected by admin if we update frontend, but left public for now 
  // until we use the new /api/admin/results route. (Original requirement didn't specify auth for this yet, 
  // but we add protected versions below).
  try {
    const rawData = fs.readFileSync(resultsPath, 'utf8');
    const results = JSON.parse(rawData);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve results' });
  }
});

// --- ADMIN ROUTES ---

// Simple hardcoded login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded for assignment scope
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'admin-token-123' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Admin Middleware
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer admin-token-123') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized Access' });
  }
};

// 1. Dashboard Stats
app.get('/api/admin/dashboard-stats', requireAdmin, (req, res) => {
  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const questionsPath = path.join(__dirname, 'questions.json');
    const questions = fs.existsSync(questionsPath) ? JSON.parse(fs.readFileSync(questionsPath, 'utf8')) : {};

    let totalScore = 0;

    results.forEach(r => {
      totalScore += r.percentage;
    });

    const averageScore = results.length > 0 ? (totalScore / results.length) : 0;

    res.json({
      totalStudents: results.length,
      averageScore: Math.round(averageScore),
      questionsCount: {
        '6': questions['6']?.length || 0,
        '7': questions['7']?.length || 0,
        '8': questions['8']?.length || 0
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// 1.5 GET Live Monitor
app.get('/api/admin/live-monitor', requireAdmin, (req, res) => {
  try {
    const now = Date.now();
    const activeList = [];

    for (const [key, data] of activeExams.entries()) {
        // Drop them if inactive for over 35 seconds
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

// 2. GET Questions (Admin view)
app.get('/api/admin/questions/:class', requireAdmin, (req, res) => {
  try {
    const classId = req.params.class;
    const questionsPath = path.join(__dirname, 'questions.json');
    const questions = fs.existsSync(questionsPath) ? JSON.parse(fs.readFileSync(questionsPath, 'utf8')) : {};

    res.json(questions[classId] || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// 3. POST new Question
app.post('/api/admin/questions', requireAdmin, (req, res) => {
  try {
    const { studentClass, questionText, options, correctIndex } = req.body;

    if (!studentClass || !questionText || options.length !== 4 || typeof correctIndex !== 'number') {
      return res.status(400).json({ error: 'Invalid question data' });
    }

    const questionsPath = path.join(__dirname, 'questions.json');
    const questions = fs.existsSync(questionsPath) ? JSON.parse(fs.readFileSync(questionsPath, 'utf8')) : {};

    if (!questions[studentClass]) questions[studentClass] = [];

    const crypto = require('crypto');
    const newQuestion = {
      id: crypto.randomUUID(),
      question: questionText,
      options,
      correct: correctIndex
    };

    questions[studentClass].push(newQuestion);
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// 4. PUT update Question
app.put('/api/admin/questions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { studentClass, questionText, options, correctIndex } = req.body;

    const questionsPath = path.join(__dirname, 'questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    if (!questions[studentClass]) return res.status(404).json({ error: 'Class not found' });

    const qIndex = questions[studentClass].findIndex(q => q.id === id);
    if (qIndex === -1) return res.status(404).json({ error: 'Question not found' });

    questions[studentClass][qIndex] = {
      id,
      question: questionText,
      options,
      correct: correctIndex
    };

    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
    res.json(questions[studentClass][qIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// 5. DELETE Question
app.delete('/api/admin/questions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { studentClass } = req.query; // pass class in query

    if (!studentClass) return res.status(400).json({ error: 'studentClass query required' });

    const questionsPath = path.join(__dirname, 'questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    if (!questions[studentClass]) return res.status(404).json({ error: 'Class not found' });

    questions[studentClass] = questions[studentClass].filter(q => q.id !== id);

    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// 6. GET Admin Results
app.get('/api/admin/results', requireAdmin, (req, res) => {
  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve results' });
  }
});

// 7. DELETE Result Entry
app.delete('/api/admin/results/:roll/:studentClass', requireAdmin, (req, res) => {
  try {
    const { roll, studentClass } = req.params;

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const filtered = results.filter(r => !(String(r.roll) === String(roll) && String(r.class) === String(studentClass)));

    fs.writeFileSync(resultsPath, JSON.stringify(filtered, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete result' });
  }
});


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

// 11. POST Settings
app.post('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const newSettings = req.body;
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Serve static frontend files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all route for React app (client-side routing)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).send('Frontend build not found. Please run npm run build in the frontend directory.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Accessible on LAN over the host IP address (e.g., http://192.168.x.x:${PORT})`);
});
