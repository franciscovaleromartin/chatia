import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

// Mock user data for demo
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
        // Simulate loading and auto-login for demo
        setTimeout(() => {
            const savedUser = localStorage.getItem('chatia_demo_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setLoading(false);
        }, 500);
    }, []);

    const login = (email, password) => {
        // Mock login - always succeeds in demo mode
        localStorage.setItem('chatia_demo_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
    };

    const logout = () => {
        localStorage.removeItem('chatia_demo_user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, login }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
