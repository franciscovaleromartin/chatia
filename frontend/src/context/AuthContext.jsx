import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Mock user data for demo mode fallback
const MOCK_USER = {
    id: 1,
    email: 'demo@chatia.com',
    name: 'Demo User',
    is_admin: false
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            // Not authenticated or demo mode
            const savedUser = localStorage.getItem('chatia_demo_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = () => {
        // Redirect to Google OAuth
        window.location.href = '/api/auth/google';
    };

    const loginDemo = () => {
        // Demo mode login
        localStorage.setItem('chatia_demo_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('chatia_demo_user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading,
            logout,
            loginWithGoogle,
            loginDemo
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
