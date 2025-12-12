import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

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
            // Not authenticated - user must login
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = () => {
        // Redirect to Google OAuth
        window.location.href = '/api/auth/google';
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            loading,
            logout,
            loginWithGoogle
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
