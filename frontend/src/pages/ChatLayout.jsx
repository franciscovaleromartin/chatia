import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';

export default function ChatLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const refreshChats = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--color-bg)', overflow: 'hidden' }}>
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={toggleSidebar}
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 1001,
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)'
                }}
            >
                <FiMenu size={24} />
            </button>

            {/* Sidebar Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                        display: 'none'
                    }}
                />
            )}

            {/* Sidebar */}
            <div
                className={`sidebar ${sidebarOpen ? 'open' : ''}`}
                style={{
                    width: '300px',
                    borderRight: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    transition: 'transform 0.3s ease'
                }}
            >
                <Sidebar refreshTrigger={refreshTrigger} onChatSelect={closeSidebar} />
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Routes>
                    <Route path="/" element={
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', padding: '1rem', textAlign: 'center' }}>
                            Select a chat or start a new conversation
                        </div>
                    } />
                    <Route path="/chat/:chatId" element={<ChatInterface onMessageSent={refreshChats} />} />
                </Routes>
            </div>
        </div>
    );
}
