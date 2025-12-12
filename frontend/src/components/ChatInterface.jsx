import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiImage, FiCpu } from 'react-icons/fi';
import { format } from 'date-fns';
import { getAllMessagesForChat, addMessage, MOCK_CHATS } from '../mockData';

export default function ChatInterface({ onMessageSent }) {
    const { chatId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiEnabled, setAiEnabled] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = () => {
        try {
            const chatMessages = getAllMessagesForChat(chatId);
            setMessages(chatMessages);
            setTimeout(scrollToBottom, 100);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatInfo = () => {
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            setAiEnabled(chat.ai_enabled);
        }
    };

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        fetchMessages();
        fetchChatInfo();
        const interval = setInterval(fetchMessages, 2000); // Poll every 2s to catch AI responses
        return () => clearInterval(interval);
    }, [chatId]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            addMessage(chatId, newMessage);
            setNewMessage('');
            setTimeout(fetchMessages, 100);
            if (onMessageSent) onMessageSent();
        } catch (err) {
            console.error('Failed to send', err);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    addMessage(chatId, '', reader.result);
                    setTimeout(fetchMessages, 100);
                    if (onMessageSent) onMessageSent();
                } catch (err) {
                    console.error('Failed to upload image', err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleAI = () => {
        const newState = !aiEnabled;
        setAiEnabled(newState);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            chat.ai_enabled = newState;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h3 style={{ margin: 0 }}>Chat</h3>
                <button
                    onClick={toggleAI}
                    title={aiEnabled ? "Disable AI for this chat" : "Enable AI for this chat"}
                    className={`btn ${aiEnabled ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                >
                    <FiCpu style={{ marginRight: '0.5rem' }} />
                    {aiEnabled ? 'AI On' : 'AI Off'}
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, index) => {
                    const isMe = msg.sender_id === String(user?.id);
                    const isAI = msg.sender_id === 'AI';

                    return (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div
                                className="chat-message"
                                style={{
                                    maxWidth: '70%',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '18px',
                                    borderTopLeftRadius: !isMe ? '4px' : '18px',
                                    borderTopRightRadius: isMe ? '4px' : '18px',
                                    backgroundColor: isMe
                                        ? 'var(--color-primary)'
                                        : isAI
                                            ? '#e0f2fe' // Light blue for AI
                                            : 'var(--color-surface)',
                                    color: isMe ? 'white' : 'var(--color-text-main)',
                                    boxShadow: isMe ? 'none' : 'var(--shadow-sm)',
                                    border: isMe ? 'none' : '1px solid var(--color-border)'
                                }}
                            >
                                {!isMe && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem', color: isAI ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                                        {isAI ? 'IA' : `User ${msg.sender_id}`}
                                    </div>
                                )}

                                {msg.image_url ? (
                                    <img src={msg.image_url} alt="Shared" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                )}

                                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.4rem', textAlign: 'right' }}>
                                    {format(new Date(msg.timestamp), 'HH:mm')}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
                padding: '1rem',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                gap: '0.5rem'
            }}>
                <label className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                    <FiImage size={20} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>

                <input
                    className="input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{ flex: 1 }}
                />

                <button type="submit" className="btn btn-primary" disabled={(!newMessage.trim())}>
                    <FiSend size={20} />
                </button>
            </form>
        </div>
    );
}
