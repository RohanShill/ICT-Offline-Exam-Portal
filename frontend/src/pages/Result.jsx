import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Result() {
    const { studentInfo, examState, logout } = useExam();
    const navigate = useNavigate();

    useEffect(() => {
        // If not logged in or exam not finished, redirect
        if (!studentInfo || !examState.isFinished) {
            navigate('/');
        }
    }, [studentInfo, examState.isFinished, navigate]);

    if (!studentInfo || !examState.isFinished || !examState.questions) {
        return null; // Will redirect shortly
    }

    // Calculate score locally since we don't fetch it back from /submit
    let score = 0;
    const total = examState.questions.length;
    examState.questions.forEach((q, index) => {
        if (examState.answers[index] === q.correct) {
            score += 1;
        }
    });

    const percentage = Math.round((score / total) * 100);
    const isPass = percentage >= 50;

    const handleRestart = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className={`border-b-4 ${isPass ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <CardTitle className={isPass ? 'text-green-800' : 'text-red-800'}>
                        {isPass ? 'Examination Passed' : 'Examination Failed'}
                    </CardTitle>
                    <div className="mt-2 flex justify-center">
                        {isPass ? (
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{studentInfo.name}</h3>
                        <p className="text-gray-500">Roll: {studentInfo.roll} • Class: {studentInfo.studentClass}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Score</p>
                                <p className="text-3xl font-bold text-gray-800">{score} / {total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Percentage</p>
                                <p className={`text-3xl font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400">
                        Submitted on {new Date().toLocaleString()}
                    </div>

                    <Button variant="secondary" className="w-full mt-4" onClick={handleRestart}>
                        Return to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
