import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { getQuestions, submitResult } from '../utils/api';
import api from '../utils/api';
import { AlertTriangle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Exam() {
    const { studentInfo, examState, setQuestions, setAnswer, updateTime, finishExam } = useExam();
    const navigate = useNavigate();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const { globalSettings } = useSettings();
    const [violations, setViolations] = useState(() => parseInt(sessionStorage.getItem('examViolations') || '0', 10));
    const [showWarningModal, setShowWarningModal] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        if (!studentInfo) {
            navigate('/');
            return;
        }

        if (examState.isFinished) {
            navigate('/result');
            return;
        }

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

        if (examState.hasStarted && !examState.isFinished) {
            timerRef.current = setInterval(() => {
                if (examState.timeRemaining <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                } else {
                    updateTime(examState.timeRemaining - 1);
                }
            }, 1000);
            // Live monitor pinging
            const sendPing = () => {
                const total = examState.questions?.length || 1;
                const answered = Object.keys(examState.answers || {}).length;
                const percent = Math.round((answered / total) * 100);
                
                api.post('/student/exam/ping', {
                    name: studentInfo.name,
                    roll: studentInfo.roll,
                    studentClass: studentInfo.studentClass,
                    section: studentInfo.section,
                    progress: `${percent}%`,
                    status: 'In Progress',
                    timeRemaining: examState.timeRemaining
                }).catch(err => console.log('Monitor ping failed', err));
            };
            
            sendPing(); // Initial ping immediately!
            const pingInterval = setInterval(sendPing, 5000); // then every 5 seconds
            
            return () => {
                clearInterval(timerRef.current);
                clearInterval(pingInterval);
            };
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [studentInfo, examState, navigate, setQuestions, updateTime]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handleViolation = () => {
            setViolations(prev => {
                const next = prev + 1;
                sessionStorage.setItem('examViolations', next);
                if (next < 3) {
                    setShowWarningModal(true);
                }
                return next;
            });
        };

        const handleVisibilityChange = () => {
            if (document.hidden && !examState.isFinished && examState.hasStarted) {
                handleViolation();
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !examState.isFinished && examState.hasStarted) {
                handleViolation();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [examState.isFinished, examState.hasStarted]);

    useEffect(() => {
        if (violations >= 3 && examState.hasStarted && !examState.isFinished) {
            handleAutoSubmit();
        }
    }, [violations, examState.hasStarted, examState.isFinished]);

    const handleAutoSubmit = async () => {
        await submitCurrentExam();
    };

    const handleManualSubmit = () => {
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
                section: studentInfo.section,
                score,
                total,
                percentage,
                date: new Date().toISOString()
            };

            await submitResult(payload);
            
            // Send final ping to clear from live monitor immediately
            await api.post('/student/exam/ping', {
                name: studentInfo.name,
                roll: studentInfo.roll,
                studentClass: studentInfo.studentClass,
                section: studentInfo.section,
                status: 'Submitted'
            }).catch(() => {});

            finishExam();
            navigate('/result');

        } catch (err) {
            // Even if network fails, just push them to result page in offline mode demo
            api.post('/student/exam/ping', {
                name: studentInfo.name,
                roll: studentInfo.roll,
                studentClass: studentInfo.studentClass,
                section: studentInfo.section,
                status: 'Submitted'
            }).catch(() => {});
            
            finishExam();
            navigate('/result');
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleMarkForReview = () => {
        setMarkedForReview(prev => {
            const nextSet = new Set(prev);
            if (nextSet.has(currentQuestionIndex)) {
                nextSet.delete(currentQuestionIndex);
            } else {
                nextSet.add(currentQuestionIndex);
            }
            return nextSet;
        });
    };

    if (!studentInfo || !examState.questions) {
        return <div className="min-h-screen bg-[#0d1321] flex items-center justify-center text-white">Loading...</div>;
    }

    const currentQuestion = examState.questions[currentQuestionIndex];
    if (!currentQuestion) return null;
    
    // Status helpers
    const hasAnsweredCurrent = examState.answers[currentQuestionIndex] !== undefined;

    return (
        <div className="min-h-screen p-6 font-sans bg-transparent">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
                
                {/* Header Card */}
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-xl border border-black/10 dark:border-white/20">
                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                            {studentInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                            <h2 className="font-bold text-gray-900 dark:text-white text-[18px] tracking-tight">{studentInfo.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-[13px] mt-0.5">Roll: {studentInfo.roll} • Class {studentInfo.studentClass}{studentInfo.section ? ` • Section ${studentInfo.section}` : ''}</p>
                        </div>
                    </div>

                    {/* School Branding */}
                    <div className="hidden md:flex bg-indigo-50 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-800 rounded-xl px-5 py-2 font-bold tracking-tight shadow-sm items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        {globalSettings.schoolName || 'ICT Exam Portal'}
                    </div>

                    {/* Timer & Submit */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span>{formatTime(examState.timeRemaining)}</span>
                        </div>
                        <button onClick={handleManualSubmit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors">
                            Submit Exam
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-[#ffe4e6] text-[#e11d48] px-4 py-3 text-sm font-medium border border-red-200">
                        {error}
                    </div>
                )}

                {/* Main Content Layout - 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    
                    {/* Left Panel: Question Card */}
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl flex flex-col border border-black/10 dark:border-white/20">
                        <div className="bg-gray-50/80 dark:bg-gray-800/80 py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider">
                            Question {currentQuestionIndex + 1} of {examState.questions.length}
                        </div>
                        
                        <div className="p-8 flex-grow">
                            <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                                {currentQuestion.question}
                            </h3>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = examState.answers[currentQuestionIndex] === idx;
                                    const hasAnsweredCurrent = examState.answers[currentQuestionIndex] !== undefined;
                                    
                                    let wrapClass = "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer";
                                    let textClass = "text-gray-700 dark:text-gray-300 font-medium";
                                    let letterBoxClass = "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-600";

                                    if (globalSettings.showAnswers && hasAnsweredCurrent) {
                                        // Answer is locked, truth is revealed
                                        if (isSelected && idx === currentQuestion.correct) {
                                            wrapClass = "border-2 border-green-500 bg-green-50 shadow-sm cursor-not-allowed";
                                            textClass = "text-green-900 font-bold";
                                            letterBoxClass = "bg-green-500 text-white border-transparent";
                                        } else if (isSelected && idx !== currentQuestion.correct) {
                                            wrapClass = "border-2 border-red-500 bg-red-50 shadow-sm cursor-not-allowed";
                                            textClass = "text-red-900 font-bold";
                                            letterBoxClass = "bg-red-500 text-white border-transparent";
                                        } else if (idx === currentQuestion.correct) {
                                            wrapClass = "border-2 border-green-300 bg-green-50/50 cursor-not-allowed";
                                            textClass = "text-green-800 font-semibold";
                                            letterBoxClass = "bg-green-300 text-green-900 border-transparent";
                                        } else {
                                            wrapClass = "border border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed";
                                        }
                                    } else {
                                        // Standard behavior
                                        if (isSelected) {
                                            wrapClass = "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30 shadow-sm";
                                            textClass = "text-indigo-900 dark:text-indigo-300 font-bold";
                                            letterBoxClass = "bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-transparent shadow-sm";
                                        }
                                    }

                                    const handleSelect = () => {
                                        if (globalSettings.showAnswers && hasAnsweredCurrent) return; // Locked!
                                        setAnswer(currentQuestionIndex, idx);
                                    };

                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={handleSelect}
                                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${wrapClass}`}
                                        >
                                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded ${letterBoxClass} text-sm`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className={`flex-grow ${textClass} text-sm`}>
                                                {option}
                                            </div>
                                            
                                            {/* Icons for normal selection vs revealed answers */}
                                            {isSelected && !globalSettings.showAnswers && (
                                                <div className="w-6 h-6 bg-green-500 rounded text-white flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            {globalSettings.showAnswers && hasAnsweredCurrent && idx === currentQuestion.correct && (
                                                <div className="w-6 h-6 bg-green-500 rounded text-white flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            {globalSettings.showAnswers && hasAnsweredCurrent && isSelected && idx !== currentQuestion.correct && (
                                                <div className="w-6 h-6 bg-red-500 rounded text-white flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" strokeWidth="3"></line><line x1="6" y1="6" x2="18" y2="18" strokeWidth="3"></line></svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 md:px-6 flex flex-wrap justify-center sm:justify-end items-center gap-3 md:gap-4 mt-auto rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                            <button 
                                onClick={toggleMarkForReview}
                                className="text-orange-500 font-bold text-sm px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors border border-transparent hover:border-orange-100 dark:hover:border-orange-800/50"
                            >
                                {markedForReview.has(currentQuestionIndex) ? 'Unmark Review' : 'Mark for Review'}
                            </button>
                            
                            <button 
                                onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="text-gray-600 dark:text-gray-300 font-bold text-sm px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 transition-colors bg-white dark:bg-gray-800 shadow-sm"
                            >
                                Previous
                            </button>

                            {currentQuestionIndex < examState.questions.length - 1 ? (
                                <button 
                                    onClick={() => setCurrentQuestionIndex(p => p + 1)}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm py-2.5 px-8 rounded-lg shadow-md transition-all"
                                >
                                    Next
                                </button>
                            ) : (
                                <button 
                                    onClick={handleManualSubmit}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2.5 px-6 rounded-lg shadow-md transition-all"
                                >
                                    Submit Exam
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Question Map */}
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl flex flex-col border border-black/10 dark:border-white/20">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">Question Map</h3>
                            <div className="flex gap-4 mt-3 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    <div className="w-3 h-3 rounded bg-indigo-500"></div> Attempted
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    <div className="w-3 h-3 rounded bg-orange-500"></div> Review
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div> Pending
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-grow">
                            <div className="grid grid-cols-4 gap-3">
                                {examState.questions.map((_, idx) => {
                                    // Determine square styling
                                    let sqClass = "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600";
                                    
                                    const isAnswered = examState.answers[idx] !== undefined;
                                    const isMarked = markedForReview.has(idx);
                                    
                                    if (isMarked) {
                                        sqClass = "bg-orange-50 dark:bg-orange-900/40 border-2 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400 font-bold";
                                    } else if (isAnswered) {
                                        sqClass = "bg-green-50 dark:bg-green-900/40 border-2 border-green-500 text-green-700 dark:text-green-400 font-bold";
                                    }
                                    
                                    const isCurrent = currentQuestionIndex === idx;
                                    if (isCurrent && !isAnswered && !isMarked) {
                                        sqClass = "bg-white dark:bg-gray-800 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-bold shadow-md";
                                    } else if (isCurrent) {
                                        // just add a shadow/ring
                                        sqClass += " ring-2 ring-indigo-500/50 dark:ring-indigo-500/70 ring-offset-1 dark:ring-offset-gray-900";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${sqClass}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 border-t border-gray-200/60 pt-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded-sm"></div>
                                    <span className="text-xs text-gray-700 font-medium">Answered</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-orange-50 border-2 border-orange-400 rounded-sm"></div>
                                    <span className="text-xs text-gray-700 font-medium">Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
                                    <span className="text-xs text-gray-700 font-medium">Pending</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#5c4fff]">
                                <div className="w-10 h-10 border-2 border-[#5c4fff] rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                            <h3 className="text-[22px] font-bold text-gray-900 mb-2">Submit Exam?</h3>
                            <p className="text-gray-500 text-xs mb-8 leading-relaxed">Are you sure you want to finish the exam? This action cannot be undone.</p>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={cancelSubmit}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showWarningModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Warning!</h3>
                                <p className="text-gray-600 mb-6 font-medium">
                                    You exited fullscreen or switched tabs. This is violation <strong className="text-red-600 border-b-2 border-red-600 px-1">{violations} of 3</strong>.
                                    <br/><br/>
                                    If you reach 3 violations, your exam will be immediately submitted.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowWarningModal(false);
                                        try {
                                            if (document.documentElement.requestFullscreen) {
                                                document.documentElement.requestFullscreen();
                                            }
                                        } catch(e) {}
                                    }}
                                    className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                                >
                                    Return to Exam
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
