import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [adminToken, setAdminToken] = useState(() => {
        return localStorage.getItem('adminToken') || null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(!!adminToken);

    useEffect(() => {
        if (adminToken) {
            localStorage.setItem('adminToken', adminToken);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
        }
    }, [adminToken]);

    const loginAdmin = async (username, password) => {
        try {
            const response = await api.post('/admin/login', { username, password });
            if (response.data.token) {
                setAdminToken(response.data.token);
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    };

    const logoutAdmin = () => {
        setAdminToken(null);
    };

    // Helper for authenticated requests
    const getAuthHeaders = () => {
        return { Authorization: `Bearer ${adminToken}` };
    };

    return (
        <AdminAuthContext.Provider value={{
            isAuthenticated,
            loginAdmin,
            logoutAdmin,
            getAuthHeaders
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
