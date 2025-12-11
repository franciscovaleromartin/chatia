import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();

    const handleLogin = () => {
        // Demo mode - auto login
        login('demo@chatia.com', 'demo');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: 'var(--color-bg)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '3rem',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>ChatIA</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Connect with AI and friends in a minimalist space.
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', backgroundColor: '#fff3cd', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    🎭 Demo Mode - Click to enter
                </p>

                <button
                    onClick={handleLogin}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                    Enter Demo
                </button>
            </div>
        </div>
    );
}
