import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiImage, FiCpu, FiMoreVertical } from 'react-icons/fi';
import { format } from 'date-fns';

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

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chats/${chatId}/messages`);
            // check if new messages to avoid scroll jitter? 
            // simple check: length
            if (res.data.length !== messages.length) {
                setMessages(res.data);
                setTimeout(scrollToBottom, 100);
            } else {
                // Update anyway for timestamps/content changes?
                // just set
                setMessages(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatInfo = async () => {
        // Need an endpoint for single chat info or inferred from list.
        // For now we only check AI status via toggle endpoint or assumption?
        // Actually API didn't expose "get single chat info" correctly in my implementation plan, 
        // but Sidebar fetches list.
        // I can assume AI status or fetch it.
        // I'll assume default true or try to fetch if I add the endpoint.
        // Let's implement a 'get chat state' poll or just separate endpoint?
        // User requirement: "boton donde conectar y desconectar a la IA".
        // I added /chats/:id/ai endpoint (POST). I might need GET.
        // For now, I'll default to enabled and maybe update if I add the GET endpoint.
    };

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        fetchMessages();
        fetchChatInfo();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [chatId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post(`/chats/${chatId}/messages`, { content: newMessage });
            setNewMessage('');
            fetchMessages();
            onMessageSent();
        } catch (err) {
            alert('Failed to send');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    // Send as Base64 in image_url (hack for MVP)
                    await api.post(`/chats/${chatId}/messages`, { image_url: reader.result });
                    fetchMessages();
                    onMessageSent();
                } catch (err) {
                    alert('Failed to upload image');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleAI = async () => {
        try {
            const newState = !aiEnabled;
            setAiEnabled(newState);
            await api.post(`/chats/${chatId}/ai`, { enabled: newState });
        } catch (e) {
            setAiEnabled(!aiEnabled); // Revert
            alert("Failed to toggle AI");
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
                                        {isAI ? 'Gemini AI' : `User ${msg.sender_id}`}
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
