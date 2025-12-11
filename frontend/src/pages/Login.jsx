import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';

export default function Login() {
    const { loginWithGoogle, loginDemo } = useAuth();

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
                    onClick={loginWithGoogle}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        fontSize: '1.1rem',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}
                >
                    <FaGoogle />
                    Sign in with Google
                </button>

                <div style={{
                    margin: '1.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
                </div>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1rem',
                    backgroundColor: '#fff3cd',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ffc107'
                }}>
                    🎭 Demo Mode
                </p>

                <button
                    onClick={loginDemo}
                    className="btn"
                    style={{
                        width: '100%',
                        fontSize: '1rem',
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)'
                    }}
                >
                    Enter Demo
                </button>
            </div>
        </div>
    );
}
