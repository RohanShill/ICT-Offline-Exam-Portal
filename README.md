# 🎓 ICT Exam Portal V2

> A modern, full-stack **Online Examination System** built for ICT classes — with a sleek Admin Dashboard and a clean Student Exam Interface. Designed to run on a local network (LAN), making it perfect for schools and computer labs without requiring an internet connection.

---

## ✨ What's New in V2

This is a **complete rewrite** of the original ICT Exam Portal with major improvements:

- 🎨 **Redesigned UI** — Premium SaaS-style dark theme with glassmorphism cards, smooth gradients, and micro-animations
- 📡 **Live Exam Monitoring** — Real-time tracking of students currently taking the exam via lightweight heartbeat polling
- ⚙️ **Global Exam Settings** — Admin can toggle "Show Immediate Answers" on/off dynamically for all students mid-exam
- 🔒 **Session Enforcement** — Students cannot start an exam unless the admin has created an active exam session for their class
- 📊 **Enhanced Admin Dashboard** — Live stats, question bank management, session scheduling, and result exports

---

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 (Vite), TailwindCSS       |
| Backend    | Node.js, Express.js                 |
| Storage    | JSON file-based (no database setup) |
| Networking | LAN-accessible via `0.0.0.0`       |

---

## 📁 Project Structure

```
ICT Exam Portal V2/
├── backend/
│   ├── server.js          # Express API server
│   ├── questions.json     # Question bank (per class)
│   ├── result.json        # Student results
│   ├── sessions.json      # Admin exam sessions
│   └── settings.json      # Global settings (show answers toggle)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Student login with session verification
│   │   │   ├── Exam.jsx           # Exam interface with live pinging
│   │   │   ├── Result.jsx         # Result display
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx
│   │   │       ├── AdminDashboard.jsx  # Stats + Live Monitor + Settings
│   │   │       ├── AdminSessions.jsx   # Exam session management
│   │   │       ├── AdminQuestions.jsx   # Question CRUD
│   │   │       └── AdminResults.jsx    # Results & export
│   │   ├── context/       # React Context (ExamContext, AdminAuthContext)
│   │   ├── components/    # Reusable UI components
│   │   └── utils/         # API utilities
│   └── ...
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/RohanShildit/ICT-Offline-Exam-Portal.git
cd ICT-Offline-Exam-Portal

# Install all dependencies (root + frontend + backend)
npm run install-all
```

### Running the Application

You need **two terminals** running simultaneously:

**Terminal 1 — Backend Server:**
```bash
npm run dev-backend
```
> Server starts at `http://localhost:3000`

**Terminal 2 — Frontend Dev Server:**
```bash
npm run dev-frontend
```
> Frontend starts at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm start
```
> This builds the React frontend and serves everything from the Express backend on port 3000.

---

## 👨‍🎓 Student Side

### Login Screen
- Students enter their **Full Name**, **Roll Number**, and select their **Class** (6, 7, or 8)
- The system verifies if the admin has started an active exam session for that class
- If no session is active, the student is blocked with a clear error message

### Exam Interface
- Clean, distraction-free exam environment
- **Question Map** sidebar for quick navigation
- **Mark for Review** functionality
- **Auto-submit** when the timer runs out
- **Live heartbeat** pings the server every 5 seconds so admins can monitor progress in real-time

### Answer Reveal Mode
- When the admin enables "Show Immediate Answers":
  - ✅ Correct answers highlight in **green** with a checkmark
  - ❌ Wrong answers highlight in **red** with an X, and the correct answer is revealed in green
  - 🔒 The answer is **locked** — students cannot change it once selected

---

## 🛡️ Admin Side

### Login
- URL: `/admin/login`
- Default credentials: `admin` / `admin123`

### Dashboard
- **Total Participants** — Number of students who have completed exams
- **Average Score** — Overall performance percentage
- **Question Bank Count** — Per-class question totals
- **Global Exam Configuration** — Toggle "Show Immediate Answers" on/off
- **Live Exam Monitor** — See active test takers in real-time with progress bars and status

### Exam Sessions
- Create exam sessions per class with a name, date, and duration
- Set status to `ACTIVE` or `ENDED`
- Students can only begin exams when a session is `ACTIVE` for their class

### Questions Management
- Add, edit, and delete questions per class
- Each question has 4 options with one correct answer
- Bulk CSV upload support (coming soon)

### Results
- View all student results with scores and percentages
- Delete individual results
- Export functionality

---

## 📡 Live Monitoring Architecture

The live monitoring system is designed to be **extremely lightweight**, safe for low-powered school PCs:

```
Student Browser                    Server                     Admin Dashboard
     │                               │                              │
     │── POST /exam/ping ──────────►│                              │
     │   (every 5 seconds)           │── stores in memory ──►      │
     │                               │                              │
     │                               │◄── GET /live-monitor ───────│
     │                               │    (every 5 seconds)         │
     │                               │                              │
     │                               │── auto-cleanup after 35s ──►│
```

- **Student ping**: Tiny JSON payload every 5 seconds (~200 bytes)
- **Server storage**: In-memory `Map` — zero disk I/O
- **Auto-cleanup**: Students inactive for 35+ seconds are automatically removed
- **No WebSockets**: Pure HTTP polling — works through any firewall/proxy

---

## 🔧 API Endpoints

### Public
| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/questions?class=X`      | Fetch questions for a class    |
| POST   | `/api/submit`                 | Submit exam result             |
| POST   | `/api/student/exam/ping`      | Student heartbeat for monitor  |
| POST   | `/api/student/verify-session` | Verify active session exists   |
| GET    | `/api/settings`               | Fetch global settings          |

### Admin (requires Bearer token)
| Method | Endpoint                            | Description              |
|--------|-------------------------------------|--------------------------|
| POST   | `/api/admin/login`                  | Admin authentication     |
| GET    | `/api/admin/dashboard-stats`        | Dashboard statistics     |
| GET    | `/api/admin/live-monitor`           | Active test takers       |
| GET    | `/api/admin/questions/:class`       | Questions by class       |
| POST   | `/api/admin/questions`              | Add a question           |
| PUT    | `/api/admin/questions/:id`          | Update a question        |
| DELETE | `/api/admin/questions/:id`          | Delete a question        |
| GET    | `/api/admin/results`                | All results              |
| DELETE | `/api/admin/results/:roll/:class`   | Delete a result          |
| GET    | `/api/admin/sessions`               | All exam sessions        |
| POST   | `/api/admin/sessions`               | Create exam session      |
| DELETE | `/api/admin/sessions/:id`           | Delete exam session      |
| POST   | `/api/admin/settings`               | Update global settings   |

---

## 🌐 LAN Access

The backend binds to `0.0.0.0`, making it accessible to any device on the same local network:

1. Find your PC's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Students connect to: `http://YOUR_IP:3000`

---

## 📝 License

This project is built for educational purposes at PM Shri KGBV Hiranpur.

---

## 👨‍💻 Developer

**Rohan Shildit**

Built with ❤️ for making ICT education accessible and engaging.
