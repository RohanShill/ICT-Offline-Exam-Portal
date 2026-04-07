import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LayoutDashboard, CalendarClock, FileQuestion, Users, LogOut, Shield } from 'lucide-react';

export default function AdminLayout() {
    const { isAuthenticated, logoutAdmin } = useAdminAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleLogout = () => {
        logoutAdmin();
    };

    const navLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Exam Sessions', path: '/admin/sessions', icon: <CalendarClock size={20} /> },
        { name: 'Questions', path: '/admin/questions', icon: <FileQuestion size={20} /> },
        { name: 'Results', path: '/admin/results', icon: <Users size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-transparent font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl flex flex-col z-20">
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <Shield className="text-gray-900 mr-3" size={28} />
                    <span className="font-bold text-gray-900 text-lg">Admin Portal</span>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 w-full h-full">
                <Outlet />
            </main>
        </div>
    );
}
