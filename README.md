# 🎓 ICT Offline Exam Portal

A robust, full-stack Offline Examination Portal built for schools and educational institutions. This platform empowers administrators to manage questions, schedule completely secure exam sessions, and monitor student progress in real-time, all engineered to run cleanly on a local network or offline environment.

---

## 🚀 Key Features

### 👨‍🎓 Student Experience
*   **Dual-Branded UI:** Dynamically displays the school's localized name and portal title.
*   **Anti-Cheat Fullscreen Mode:** Students are automatically locked into a fullscreen application environment. Navigating away triggers persistent warnings and forces submission upon violations.
*   **Dynamic Timers & Sessions:** Timers correctly respond directly to scheduled configurations defined by the administrator—eliminating hardcoded limits.
*   **Shuffled question/option order:** Prevents screen-looking by completely randomizing questions and options specifically for each test taker.

### 🛡️ Admin Dashboard
*   **Live Exam Monitor:** Shows a real-time sync of students currently taking active exams.
*   **Exam Sessions Management:** Create and schedule targeted exams for specific classes, sections, and durations (e.g., test5 for 2 minutes).
*   **Question Bank Management:** Add, edit, organize, and **Bulk Delete** questions separated by Class (6, 7, 8). 
*   **Global Settings Interface:** Dynamically update School Branding, UDISE Codes, and "Show Answers Immediately" toggles without restarting the server.
*   **Comprehensive Analytics:** Auto-tracking of completed participants and average scores.

---

## 🛠️ Technology Stack

**Frontend**
*   React (Vite)
*   Tailwind CSS (v4) - Fully responsive with Dark/Light Premium "Wash White" aesthetic
*   Context API for state management

**Backend**
*   Node.js & Express.js
*   SQLite (`better-sqlite3`) - Zero-configuration, local offline persistence layer.
*   CORS configured for seamless local-network cross-origin data transfer.

---

## ⚙️ Installation & Usage

Because this portal is designed to act as an offline LAN application, it consists of separated backend and frontend initialization.

### Prerequisites
*   Node.js installed on the host machine.

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev-backend
```
*   This will initialize the `exam.db` SQLite database if it doesn't already exist.
*   The server automatically runs on `http://0.0.0.0:3000`, making it accessible globally on your local network (LAN) for connected student machines.

### 2. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev-frontend
```
*   This spins up the Vite development server on `http://localhost:5173`.
*   Students running the webapp on connected systems will securely talk to your centralized host machine!

---

## 🔒 Security
*   **Anti-Refresh Timers:** Exam countdowns are locally cached into Session Storage, guaranteeing that students cannot reset their times by refreshing the page.
*   **Administrative Routing:** API logic strictly enforces Bearer Tokens verifying the master administrator prior to wiping data or accessing global settings.

---

### Developed for ICT Portals
*Version: 2.0.0*
