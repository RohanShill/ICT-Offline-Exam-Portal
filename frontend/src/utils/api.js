import axios from 'axios';

// Get backend URL relative to current host
// If running dev server on 5173, backend is likely at 3000
// If running prod build via express, it's the same origin
const isDev = import.meta.env.DEV;

// Ensure we reach the backend correctly regardless of dev/prod
const getBaseUrl = () => {
    if (isDev) {
        // Vite runs on 5173 usually, express on 3000
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:3000/api`;
    }
    return '/api'; // In production, served from same port
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getQuestions = async (studentClass) => {
    const response = await api.get(`/questions?class=${studentClass}`);
    return response.data;
};

export const submitResult = async (data) => {
    const response = await api.post('/submit', data);
    return response.data;
};

export const getResults = async () => {
    const response = await api.get('/results');
    return response.data;
};

export const verifyExamSession = async (studentClass) => {
    const response = await api.post('/student/verify-session', { studentClass });
    return response.data;
};

export default api;
