import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { verifyExamSession } from '../utils/api';

export default function Login() {
    const [formData, setFormData] = useState({
        name: '',
        roll: '',
        studentClass: ''
    });
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const { login } = useExam();
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
            await verifyExamSession(formData.studentClass);
            
            // Save to context and navigate to exam
            login(formData);
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

            <Card className="w-full max-w-md relative z-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/95 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white/50 border-b border-gray-100 pb-6 pt-10 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">ICT Exam Portal</CardTitle>
                        <p className="text-gray-500 font-semibold text-xs mt-2 uppercase tracking-[0.15em]">Online Examination</p>
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
                            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-gray-50 text-gray-900 font-medium"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="roll" className="text-sm font-semibold text-gray-700">Roll Number</label>
                            <input
                                type="text"
                                id="roll"
                                name="roll"
                                value={formData.roll}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-gray-50 text-gray-900 font-medium"
                                placeholder="Enter your roll number"
                                required
                            />
                        </div>

                        <div className="space-y-1.5 relative">
                            <label htmlFor="studentClass" className="text-sm font-semibold text-gray-700">Class</label>
                            <div className="relative">
                                <select
                                    id="studentClass"
                                    name="studentClass"
                                    value={formData.studentClass}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-gray-50 text-gray-900 appearance-none font-medium h-[48px]"
                                    required
                                >
                                    <option value="" disabled>Select your class</option>
                                    <option value="6">Class 6</option>
                                    <option value="7">Class 7</option>
                                    <option value="8">Class 8</option>
                                </select>
                                {/* Custom dropdown arrow */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 h-full">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isChecking}
                            className="w-full mt-8 h-12 text-base font-bold tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isChecking ? 'Verifying Session...' : 'Begin Authorized Exam'}
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
