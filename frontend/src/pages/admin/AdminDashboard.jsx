import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, FileQuestion, GraduationCap, Settings2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function AdminDashboard() {
    const { getAuthHeaders, logoutAdmin } = useAdminAuth();
    const { globalSettings } = useSettings();
    const [stats, setStats] = useState(null);
    const [liveTakers, setLiveTakers] = useState([]);
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
        
        const fetchLiveMonitor = async () => {
            try {
                const res = await api.get('/admin/live-monitor', { headers: getAuthHeaders() });
                setLiveTakers(res.data);
            } catch (err) {
                // Ignore monitor error silently to avoid breaking stats
            }
        };
        fetchLiveMonitor();
        const monInterval = setInterval(fetchLiveMonitor, 5000); // 5 sec live fetch
        
        return () => clearInterval(monInterval);
    }, [getAuthHeaders, logoutAdmin]);

    if (loading) return <div className="p-8">Loading dashboard...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                    {globalSettings.schoolName ? `${globalSettings.schoolName} - ICT Exam Portal` : 'ICT Exam Portal'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white rounded-2xl shadow-xl border border-white/40 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Participants</p>
                                <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.totalStudents}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                                <Users size={26} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-xl border border-white/40 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Average Score</p>
                                <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.averageScore}%</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                <GraduationCap size={26} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-xl border border-white/40 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions Bank</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-semibold">Class 6</span>
                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{stats.questionsCount['6']}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-semibold">Class 7</span>
                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{stats.questionsCount['7']}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-semibold">Class 8</span>
                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{stats.questionsCount['8']}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shadow-sm transition-transform group-hover:scale-110 ml-4">
                                <FileQuestion size={26} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Exam Monitor */}
            <div className="mt-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Live Exam Monitor
                </h2>
                <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-white/40 dark:border-white/10 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200">Active Test Takers ({liveTakers.length})</h3>
                            <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Sync
                            </span>
                        </div>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {liveTakers.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    No students are currently taking the exam.
                                </div>
                            ) : liveTakers.map((student, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{student.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Roll: {student.roll} • Class {student.studentClass}{student.section ? ` • Sec ${student.section}` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 w-1/3 min-w-[200px]">
                                        <div className="flex justify-between w-full text-xs font-bold">
                                            <span className="text-indigo-600 dark:text-indigo-400 truncate mr-2">{student.status}</span>
                                            <span className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-600 font-mono">{student.progress}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: student.progress }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
