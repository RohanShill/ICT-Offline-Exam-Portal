import React, { createContext, useContext, useState, useEffect } from 'react';

const ExamContext = createContext();

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

    const login = (info) => {
        setStudentInfo(info);
        startExam();
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

    const setQuestions = (questions) => {
        setExamState(prev => ({ ...prev, questions }));
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
