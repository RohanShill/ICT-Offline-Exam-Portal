import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { useSettings } from '../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { verifyExamSession } from '../utils/api';

export default function Login() {
    const [formData, setFormData] = useState({
        name: '',
        roll: '',
        studentClass: '',
        section: 'A'
    });
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    
    const { login } = useExam();
    const { globalSettings } = useSettings();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.roll.trim() || !formData.studentClass) {
            setError('All fields are required.');
            return;
        }

        setIsChecking(true);
        try {
            const sessionData = await verifyExamSession(formData.studentClass, formData.section);
            
            // Auto-trigger fullscreen
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (fsErr) {
                console.warn('Fullscreen request failed', fsErr);
            }

            // Save to context and navigate to exam (use session-specific duration)
            const sessionDuration = sessionData?.duration ? parseInt(sessionData.duration) : 30;
            login(formData, sessionDuration);
            navigate('/exam');
        } catch (err) {
            setError(err.response?.data?.error || 'Server error verifying session.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
            {/* Background is handled globally now, maybe soft overlay blobs here */}
            <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 -right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <Card className="w-full max-w-md relative z-10 border border-black/10 dark:border-white/20 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 pb-6 pt-10 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {globalSettings.schoolName || "Welcome"}
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight text-center px-4">
                                ICT Exam Portal
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-semibold text-xs pt-1 uppercase tracking-[0.15em]">
                                Online Examination
                            </p>
                        </div>
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
                            <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="roll" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Roll Number</label>
                            <input
                                type="text"
                                id="roll"
                                name="roll"
                                value={formData.roll}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                placeholder="Enter your roll number"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 relative">
                                <label htmlFor="studentClass" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Class</label>
                                <div className="relative">
                                    <select
                                        id="studentClass"
                                        name="studentClass"
                                        value={formData.studentClass}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white appearance-none font-medium h-[48px]"
                                        required
                                    >
                                        <option value="" disabled>Select class</option>
                                        <option value="6">Class 6</option>
                                        <option value="7">Class 7</option>
                                        <option value="8">Class 8</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 h-full">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 relative">
                                <label htmlFor="section" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Section</label>
                                <div className="relative">
                                    <select
                                        id="section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white appearance-none font-medium h-[48px]"
                                        required
                                    >
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 h-full">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isChecking}
                            className="w-full mt-8 h-12 text-base font-bold tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isChecking ? 'Verifying Session...' : 'Start Exam'}
                        </Button>

                        <p className="text-xs text-center font-medium text-red-500 mt-5">
                            Do not refresh the page during the exam.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
