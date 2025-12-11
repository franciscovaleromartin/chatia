import React from 'react';

export default function Login() {
    const handleLogin = () => {
        // Redirect to backend auth endpoint
        window.location.href = '/auth/login';
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

                <button
                    onClick={handleLogin}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
}
