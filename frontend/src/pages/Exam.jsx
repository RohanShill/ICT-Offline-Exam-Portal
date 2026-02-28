import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { getQuestions, submitResult } from '../utils/api';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Exam() {
    const { studentInfo, examState, setQuestions, setAnswer, updateTime, finishExam } = useExam();
    const navigate = useNavigate();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Ref for timer to avoid re-renders causing issues
    const timerRef = useRef(null);

    useEffect(() => {
        // Prevent access if not logged in or exam already finished
        if (!studentInfo) {
            navigate('/');
            return;
        }

        if (examState.isFinished) {
            navigate('/result');
            return;
        }

        // Load questions if not already loaded
        if (!examState.questions) {
            const fetchQuestions = async () => {
                try {
                    const qs = await getQuestions(studentInfo.studentClass);
                    setQuestions(qs);
                } catch (err) {
                    setError('Failed to load questions. Please check network connection.');
                }
            };
            fetchQuestions();
        }

        // Timer logic
        if (examState.hasStarted && !examState.isFinished) {
            timerRef.current = setInterval(() => {
                if (examState.timeRemaining <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                } else {
                    updateTime(examState.timeRemaining - 1);
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [studentInfo, examState.hasStarted, examState.isFinished, examState.timeRemaining]);

    // Prevent going back or refresh bypass
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleAutoSubmit = async () => {
        await submitCurrentExam();
    };

    const handleManualSubmit = async () => {
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        await submitCurrentExam();
    };

    const cancelSubmit = () => {
        setShowConfirmModal(false);
    };

    const submitCurrentExam = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Calculate score
            let score = 0;
            const total = examState.questions.length;

            examState.questions.forEach((q, index) => {
                if (examState.answers[index] === q.correct) {
                    score += 1;
                }
            });

            const percentage = (score / total) * 100;

            const payload = {
                name: studentInfo.name,
                roll: studentInfo.roll,
                studentClass: studentInfo.studentClass,
                score,
                total,
                percentage,
                date: new Date().toISOString()
            };

            await submitResult(payload);
            finishExam();
            navigate('/result');

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit exam. Please tell the invigilator.');
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!studentInfo || !examState.questions) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const currentQuestion = examState.questions[currentQuestionIndex];
    const hasAnsweredCurrent = examState.answers[currentQuestionIndex] !== undefined;

    return (
        <div className="min-h-screen bg-[var(--color-background)] p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl shadow-md flex items-center justify-center text-xl font-bold shadow-indigo-500/30">
                            {studentInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">{studentInfo.name}</h2>
                            <p className="text-sm text-gray-500 font-medium">Roll: {studentInfo.roll} • Class {studentInfo.studentClass}</p>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${examState.timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span className={`font-mono font-bold text-xl tracking-tight ${examState.timeRemaining < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatTime(examState.timeRemaining)}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {/* Question Card */}
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center bg-gray-50">
                        <span className="text-sm font-medium text-gray-500">
                            Question {currentQuestionIndex + 1} of {examState.questions.length}
                        </span>
                    </CardHeader>

                    <CardContent className="pt-8 pb-8">
                        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
                            {currentQuestion.question}
                        </h3>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = examState.answers[currentQuestionIndex] === idx;

                                // If answered, highlight selected. The prompt asks to "Highlight correct/incorrect answers"
                                // Usually in an exam you don't show correct answers until the end, but following prompt strictly:

                                let optionStyle = 'border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50/50 cursor-pointer';

                                if (hasAnsweredCurrent) {
                                    const isCorrectAnswer = currentQuestion.correct === idx;

                                    if (isSelected && isCorrectAnswer) {
                                        optionStyle = 'border-green-500 bg-green-50 text-green-700 cursor-default';
                                    } else if (isSelected && !isCorrectAnswer) {
                                        optionStyle = 'border-red-500 bg-red-50 text-red-700 cursor-default';
                                    } else if (isCorrectAnswer) {
                                        optionStyle = 'border-green-500 bg-green-50 text-green-700 cursor-default';
                                    } else {
                                        optionStyle = 'border-gray-200 opacity-50 cursor-default';
                                    }
                                }

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (!hasAnsweredCurrent) {
                                                setAnswer(currentQuestionIndex, idx);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${optionStyle} flex items-center justify-between group`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors border ${hasAnsweredCurrent && isSelected ? 'bg-white border-transparent text-current shadow-sm' : 'bg-white border-gray-200 text-gray-500 group-hover:border-indigo-300 group-hover:text-indigo-600'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </div>
                                        {hasAnsweredCurrent && isSelected && (
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${currentQuestion.correct === idx ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={currentQuestion.correct === idx ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between items-center bg-gray-50">
                        <div>
                            {/* Optional: Show progress bar here */}
                        </div>

                        <div className="flex gap-3">
                            {currentQuestionIndex < examState.questions.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    disabled={!hasAnsweredCurrent}
                                >
                                    Next Question
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleManualSubmit}
                                    disabled={!hasAnsweredCurrent || isSubmitting}
                                    isLoading={isSubmitting}
                                >
                                    Submit Exam
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>

                {/* Custom Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Exam?</h3>
                                <p className="text-gray-500 text-sm mb-8">Are you sure you want to finish the exam? This action cannot be undone.</p>

                                <div className="flex gap-3">
                                    <Button variant="secondary" className="flex-1" onClick={cancelSubmit}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" className="flex-1" onClick={confirmSubmit}>
                                        Yes, Submit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

