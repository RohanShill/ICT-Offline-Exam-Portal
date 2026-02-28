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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-1.5 opacity-90">PM Shri MS Hiranpur Boy</h1>
                        <CardTitle>Admin Portal Login</CardTitle>
                        <p className="text-[var(--color-text-muted)] text-sm mt-1">Authorized personnel only</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 transition-shadow"
                                placeholder="Enter admin username"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 transition-shadow"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6 bg-gray-800 hover:bg-gray-900 focus:ring-gray-800"
                            isLoading={isLoading}
                        >
                            Access Dashboard
                        </Button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full text-sm text-gray-500 hover:text-gray-800 mt-4 underline decoration-transparent hover:decoration-gray-400 transition-all"
                        >
                            Return to Student Login
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
