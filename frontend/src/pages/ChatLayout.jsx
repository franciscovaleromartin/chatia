import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';

export default function ChatLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshChats = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--color-bg)' }}>
            {/* Sidebar */}
            <div style={{ width: '300px', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <Sidebar refreshTrigger={refreshTrigger} />
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                    <Route path="/" element={
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                            Select a chat or start a new conversation
                        </div>
                    } />
                    <Route path="/chat/:chatId" element={<ChatInterface onMessageSent={refreshChats} />} />
                </Routes>
            </div>
        </div>
    );
}
