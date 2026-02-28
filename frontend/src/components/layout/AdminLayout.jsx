import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LayoutDashboard, FileQuestion, Users, LogOut } from 'lucide-react';

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
        { name: 'Questions', path: '/admin/questions', icon: <FileQuestion size={20} /> },
        { name: 'Results', path: '/admin/results', icon: <Users size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[var(--color-background)]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <span className="font-semibold text-gray-800 tracking-tight">Admin Portal</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-[var(--color-primary)]'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
