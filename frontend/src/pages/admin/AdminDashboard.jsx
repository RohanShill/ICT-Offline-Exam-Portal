import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, FileQuestion, GraduationCap } from 'lucide-react';

export default function AdminDashboard() {
    const { getAuthHeaders, logoutAdmin } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard-stats', { headers: getAuthHeaders() });
                setStats(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    logoutAdmin();
                }
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [getAuthHeaders, logoutAdmin]);

    if (loading) return <div className="p-8">Loading dashboard...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2">Welcome to the PM Shri MS Hiranpur Boy Online Examination Panel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-t-blue-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Participants</p>
                                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-green-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Score</p>
                                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.averageScore}%</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                <GraduationCap size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Questions Bank</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Class 6</span>
                                        <span className="font-bold text-gray-900">{stats.questionsCount['6']}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Class 7</span>
                                        <span className="font-bold text-gray-900">{stats.questionsCount['7']}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Class 8</span>
                                        <span className="font-bold text-gray-900">{stats.questionsCount['8']}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600 ml-4">
                                <FileQuestion size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
