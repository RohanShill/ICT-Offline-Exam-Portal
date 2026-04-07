import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CalendarClock, Plus, Trash2, Clock, Calendar as CalendarIcon, X } from 'lucide-react';

export default function AdminSessions() {
    const { getAuthHeaders } = useAdminAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        class: '6',
        duration: 30,
        date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/sessions', { headers: getAuthHeaders() });
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = () => {
        setFormData({
            name: '',
            class: '6',
            duration: 30,
            date: new Date().toISOString().split('T')[0],
            status: 'ACTIVE'
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Session name is required');
            return;
        }

        try {
            await api.post('/admin/sessions', formData, { headers: getAuthHeaders() });
            setIsFormOpen(false);
            fetchSessions();
        } catch (err) {
            alert('Failed to create session');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;
        try {
            await api.delete(`/admin/sessions/${id}`, { headers: getAuthHeaders() });
            fetchSessions();
        } catch (err) {
            alert('Failed to delete session');
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exam Sessions</h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm">Schedule and manage active examination periods</p>
                </div>

                <div className="mt-4 sm:mt-0">
                    <Button onClick={handleOpenForm} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-md rounded-xl transition-all font-bold px-6 py-2.5">
                        <Plus size={18} />
                        Schedule Exam
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400 font-bold bg-white/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-md mt-6">Loading sessions...</div>
            ) : sessions.length === 0 ? (
                <div className="p-16 text-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mt-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-indigo-300">
                        <CalendarClock size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Exam Sessions Found</h3>
                    <p className="text-gray-500 font-medium max-w-md">There are currently no active or past exam sessions. Schedule a new exam to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {sessions.map(session => (
                        <Card key={session.id} className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${session.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {session.status}
                                    </div>
                                    <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                        Class {session.class}
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors">{session.name}</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <CalendarIcon size={16} className="text-gray-400" />
                                        {new Date(session.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <Clock size={16} className="text-gray-400" />
                                        {session.duration} minutes
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(session.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg flex items-center gap-2 text-sm font-bold"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Schedule Exam Session</h2>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full shadow-sm transition-all border border-transparent hover:border-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Exam Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all"
                                    placeholder="e.g. Mid Term Exam 2024"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Class</label>
                                    <select
                                        value={formData.class}
                                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all appearance-none"
                                    >
                                        <option value="6">Class 6</option>
                                        <option value="7">Class 7</option>
                                        <option value="8">Class 8</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all appearance-none"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="ENDED">Ended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Duration (mins)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                                <Button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-6 py-2.5 font-bold shadow-sm transition-all" type="button" onClick={() => setIsFormOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-xl px-6 py-2.5 font-bold shadow-md transition-all" type="submit">
                                    Schedule Exam
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
