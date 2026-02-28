import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Login() {
    const [formData, setFormData] = useState({
        name: '',
        roll: '',
        studentClass: ''
    });
    const [error, setError] = useState('');

    const { login } = useExam();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.roll.trim() || !formData.studentClass) {
            setError('All fields are required.');
            return;
        }

        // In a real app we might check if they already submitted before letting them in
        // But for now, we'll let the submit endpoint reject it if it's a duplicate.

        // Save to context and navigate to exam
        login(formData);
        navigate('/exam');
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 -right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

            <Card className="w-full max-w-md relative z-10 border border-white/40 shadow-2xl backdrop-blur-xl bg-white/60">
                <CardHeader className="bg-transparent border-b border-gray-200/50 pb-8 pt-8 rounded-t-2xl">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><path d="M8 7h8" /><path d="M8 11h8" /></svg>
                        </div>
                        <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-indigo-600 mb-1.5 opacity-90">PM Shri MS Hiranpur Boy</h1>
                        <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Online Examination</CardTitle>
                        <p className="text-gray-500 font-medium text-sm mt-3">Please enter your details to start</p>
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
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="roll" className="text-sm font-medium text-gray-700">Roll Number</label>
                            <input
                                type="text"
                                id="roll"
                                name="roll"
                                value={formData.roll}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                                placeholder="e.g. 104"
                            />
                        </div>

                        <div className="space-y-1.5 relative">
                            <label htmlFor="studentClass" className="text-sm font-medium text-gray-700">Class</label>
                            <div className="relative">
                                <select
                                    id="studentClass"
                                    name="studentClass"
                                    value={formData.studentClass}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all bg-white hover:bg-gray-50 text-gray-700 appearance-none font-medium h-[42px]"
                                >
                                    <option value="" disabled>Select your class</option>
                                    <option value="6">Class 6</option>
                                    <option value="7">Class 7</option>
                                    <option value="8">Class 8</option>
                                </select>
                                {/* Custom dropdown arrow */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 h-full">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-8 h-12 text-base font-bold tracking-wide">
                            Start Exam
                        </Button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            Do not refresh the page during the exam.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
