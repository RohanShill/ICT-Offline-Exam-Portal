# Online Examination Portal - PM Shri MS Hiranpur Boy

A lightweight, LAN-based online examination portal built for my school, **PM Shri MS Hiranpur Boy**. This system allows teachers to easily manage questions and conduct exams for students of classes 6, 7, and 8, without needing an active internet connection or cloud database.

## Features

*   **Student Portal**: A clean, distraction-free interface for students to take their exams with a built-in timer.
*   **Admin Dashboard**: A secure control panel for teachers to monitor total participants and manage the system.
*   **Question Management**: Add, edit, and delete multiple-choice questions for different classes.
*   **Results Tracking**: Automatically grades submissions and stores results for teachers to review and export to CSV.
*   **Local-First Architecture**: Runs entirely offline on a local network (LAN) using a lightweight JSON filing system—no complex database setup required.

## Tech Stack

*   **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Express.js
*   **Storage**: JSON-based local file storage

## Setup Instructions

1.  **Install Node.js**: Make sure you have Node.js installed on your computer.
2.  **Install Dependencies**:
    Open a terminal in the project root folder and run:
    ```bash
    npm install
    ```
3.  **Start the Application**:
    Run the following command to build the frontend and start the backend server:
    ```bash
    npm run start
    ```
4.  **Access the Portal**:
    *   **Student Login**: `http://localhost:3000` (or `http://<your-ip-address>:3000` on the network)
    *   **Admin Panel**: `http://localhost:3000/admin/login`
    *   **Default Admin Credentials**: username: `admin`, password: `admin123`

## How to Conduct a LAN Exam

1.  Start the application on the teacher's host computer.
2.  Find the teacher's local IP address (e.g., `192.168.1.100`) using `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
3.  Have students connect their devices to the same Wi-Fi/LAN network.
4.  Students open their web browser and navigate to `http://192.168.1.100:3000` to access the exam portal.
