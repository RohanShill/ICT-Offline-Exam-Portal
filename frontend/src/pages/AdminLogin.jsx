import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { loginAdmin } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await loginAdmin(username, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent font-sans">
            <Card className="w-full max-w-md relative z-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/95 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white/50 border-b border-gray-100 pb-6 pt-10 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h1 className="text-[11px] font-bold tracking-[0.1em] uppercase text-indigo-500 mb-2">ICT EXAM PORTAL</h1>
                        <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Admin Portal Login</CardTitle>
                        <p className="text-gray-500 font-semibold text-xs mt-2 uppercase tracking-[0.15em]">Authorized personnel only</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 px-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-gray-50 text-gray-900 font-medium"
                                placeholder="Enter admin username"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-gray-50 text-gray-900 font-medium"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-8 h-12 text-base font-bold tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01]"
                            isLoading={isLoading}
                        >
                            Access Dashboard
                        </Button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full text-xs font-semibold text-gray-400 hover:text-indigo-500 mt-6 transition-colors"
                        >
                            Return to Student Login
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
