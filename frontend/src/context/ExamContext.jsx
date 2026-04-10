import React, { createContext, useContext, useState, useEffect } from 'react';

const ExamContext = createContext();

// Fisher-Yates array shuffle utility
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const ExamProvider = ({ children }) => {
    const [studentInfo, setStudentInfo] = useState(() => {
        const saved = sessionStorage.getItem('studentInfo');
        return saved ? JSON.parse(saved) : null;
    });

    const [examState, setExamState] = useState(() => {
        const saved = sessionStorage.getItem('examState');
        return saved ? JSON.parse(saved) : {
            hasStarted: false,
            isFinished: false,
            answers: {},
            timeRemaining: 35 * 60, // 35 minutes in seconds
            questions: null
        };
    });

    // Persist state to session storage to prevent refresh bypass
    useEffect(() => {
        if (studentInfo) {
            sessionStorage.setItem('studentInfo', JSON.stringify(studentInfo));
        } else {
            sessionStorage.removeItem('studentInfo');
        }
    }, [studentInfo]);

    useEffect(() => {
        sessionStorage.setItem('examState', JSON.stringify(examState));
    }, [examState]);

    const login = (info, durationMinutes = 35) => {
        setStudentInfo(info);
        const durationSecs = durationMinutes * 60;
        setExamState(prev => ({ 
            ...prev, 
            hasStarted: true, 
            isFinished: false,
            timeRemaining: durationSecs > 0 ? durationSecs : 35 * 60
        }));
    };

    const logout = () => {
        setStudentInfo(null);
        setExamState({
            hasStarted: false,
            isFinished: false,
            answers: {},
            timeRemaining: 35 * 60,
            questions: null
        });
        sessionStorage.clear();
    };

    const startExam = () => {
        setExamState(prev => ({ ...prev, hasStarted: true, isFinished: false }));
    };

    const finishExam = () => {
        setExamState(prev => ({ ...prev, isFinished: true, hasStarted: false }));
    };

    const setQuestions = (fetchedQuestions) => {
        // Shuffle questions and options to prevent cheating
        const shuffledQuestions = shuffleArray(fetchedQuestions).map(q => {
            // Keep track of the actual text of the correct answer before shuffling options
            const originalCorrectText = q.options[q.correct];
            
            // Shuffle the 4 options
            const shuffledOptions = shuffleArray(q.options);
            
            // Find where the correct answer landed
            const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
            
            return {
                ...q,
                options: shuffledOptions,
                correct: newCorrectIndex
            };
        });

        setExamState(prev => ({ ...prev, questions: shuffledQuestions }));
    };

    const setAnswer = (questionIndex, selectedOption) => {
        setExamState(prev => ({
            ...prev,
            answers: {
                ...prev.answers,
                [questionIndex]: selectedOption
            }
        }));
    };

    const updateTime = (timeRemaining) => {
        setExamState(prev => ({ ...prev, timeRemaining }));
    };

    return (
        <ExamContext.Provider value={{
            studentInfo,
            examState,
            login,
            logout,
            startExam,
            finishExam,
            setQuestions,
            setAnswer,
            updateTime
        }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExam = () => useContext(ExamContext);
