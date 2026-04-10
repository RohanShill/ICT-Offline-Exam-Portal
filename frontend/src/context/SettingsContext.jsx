import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [globalSettings, setGlobalSettings] = useState({
        schoolName: 'ICT Exam Portal',
        udiseCode: '',
        showAnswers: false
    });

    const refreshSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data) {
                setGlobalSettings(prev => ({ ...prev, ...res.data }));
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ globalSettings, setGlobalSettings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
