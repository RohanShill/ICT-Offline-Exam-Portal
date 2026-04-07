import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';

export default function Result() {
    const { studentInfo, examState, logout } = useExam();
    const navigate = useNavigate();

    useEffect(() => {
        if (!studentInfo || !examState.isFinished) {
            navigate('/');
        }
    }, [studentInfo, examState.isFinished, navigate]);

    if (!studentInfo || !examState.isFinished || !examState.questions) {
        return <div className="min-h-screen bg-[#111827]"></div>;
    }

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
        <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-[420px] bg-[#cfd4de] rounded-xl overflow-hidden shadow-2xl relative">
                
                {/* Header Section */}
                <div className="pt-8 pb-4 text-center border-b border-gray-100/50 relative z-10 px-8">
                    <h2 className={`font-bold text-[15px] mb-4 ${isPass ? 'text-green-800' : 'text-red-800'}`}>
                        {isPass ? 'Examination Passed' : 'Examination Failed'}
                    </h2>
                    
                    <div className="flex justify-center mb-2">
                        {isPass ? (
                            <div className="w-12 h-12 bg-[#cfd4de] border-2 border-green-500 rounded-full flex items-center justify-center text-green-600 bg-white/50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-[#cfd4de] border-2 border-red-500 rounded-full flex items-center justify-center text-red-600 bg-white/50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body Section */}
                <div className="px-8 pb-8 pt-6 flex flex-col items-center text-center">
                    
                    {/* User Details */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 text-lg">{studentInfo.name}</h3>
                        <p className="text-gray-500 text-xs font-semibold">Roll: {studentInfo.roll} • Class: {studentInfo.studentClass}</p>
                    </div>

                    {/* Score Box */}
                    <div className="bg-white rounded-xl w-full flex p-5 mb-8 shadow-sm">
                        <div className="flex-1 border-r border-gray-200">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Score</p>
                            <p className="text-2xl font-bold text-gray-900">{score} / {total}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Percentage</p>
                            <p className={`text-2xl font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</p>
                        </div>
                    </div>

                    <p className="text-[#a1a1aa] text-[10px] font-medium mb-6">
                        Submitted on {new Date().toLocaleString()}
                    </p>

                    <button 
                        onClick={handleRestart}
                        className="w-full bg-[#f4f4f5] hover:bg-white text-gray-800 font-bold text-xs py-3 rounded-lg shadow-sm border border-gray-200 transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
