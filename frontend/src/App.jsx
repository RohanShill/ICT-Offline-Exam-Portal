import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Student Pages
import Login from './pages/Login';
import Exam from './pages/Exam';
import Result from './pages/Result';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminResults from './pages/admin/AdminResults';
import AdminSessions from './pages/admin/AdminSessions';

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ExamProvider>
          <Routes>
            {/* Student Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/result" element={<Result />} />

            {/* Old Admin route fallback */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/sessions" element={<AdminSessions />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/results" element={<AdminResults />} />
            </Route>

          </Routes>
        </ExamProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
