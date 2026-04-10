import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, CalendarClock, FileQuestion, Users, LogOut, Shield, Moon, Sun, Settings2 } from 'lucide-react';

export default function AdminLayout() {
    const { isAuthenticated, logoutAdmin } = useAdminAuth();
    const { theme, toggleTheme } = useTheme();
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
        { name: 'Settings', path: '/admin/settings', icon: <Settings2 size={20} /> },
    ];

    return (
        <div className={`flex flex-col md:flex-row h-screen bg-transparent font-sans ${theme === 'dark' ? 'dark text-white' : ''}`}>
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col z-20 transition-colors">
                <div className="h-16 md:h-20 flex items-center justify-between md:justify-start px-6 md:px-8 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <Shield className="text-gray-900 dark:text-gray-100 mr-3" size={28} />
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Admin Portal</span>
                    </div>
                </div>

                <nav className="flex-1 py-4 md:py-8 px-4 flex flex-row overflow-x-auto md:flex-col space-x-2 md:space-x-0 md:space-y-2 no-scrollbar">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex whitespace-nowrap items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-row md:flex-col gap-2">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 flex justify-center md:justify-start items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-semibold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                    >
                         {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                         <span className="hidden md:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex-1 flex justify-center md:justify-start items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-semibold text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="hidden md:inline">Logout</span>
                    </button>

                    <div className="hidden md:block mt-4 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                        Built by <a href="https://github.com/RohanShill" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors underline decoration-indigo-500/30 underline-offset-2">Rohan Shill</a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 w-full h-full p-2 md:p-0">
                <Outlet />
            </main>
        </div>
    );
}
