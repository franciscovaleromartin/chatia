import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import logo from '../assets/ecco-logo.svg';

export default function Login() {
    const { loginWithGoogle } = useAuth();

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
                <img
                    src={logo}
                    alt="ECCO AI Logo"
                    style={{
                        width: '200px',
                        height: 'auto',
                        marginBottom: '1.5rem'
                    }}
                />
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>ChatIA</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Chatea con tus amigos y la IA
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
                        gap: '0.5rem'
                    }}
                >
                    <FaGoogle />
                    Conectar con Google
                </button>
            </div>
        </div>
    );
}
