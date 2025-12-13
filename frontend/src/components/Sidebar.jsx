import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiSettings, FiUser, FiLogOut, FiTrash2 } from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import AdminModal from './AdminModal';
import { getAllChats, createChat as createMockChat, deleteChat } from '../mockData';

export default function Sidebar({ refreshTrigger, onChatSelect }) {
    const { user, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [swipedChat, setSwipedChat] = useState(null); // Track which chat is swiped
    const [dragStart, setDragStart] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);
    const navigate = useNavigate();

    const fetchChats = () => {
        try {
            const allChats = getAllChats();
            setChats(allChats);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchChats();
        // Simple polling for chat list updates every 10s
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const createChat = () => {
        const name = prompt("Enter chat name:");
        if (name) {
            try {
                const newChat = createMockChat(name);
                fetchChats();
                navigate(`/chat/${newChat.id}`);
                if (onChatSelect) onChatSelect();
            } catch (e) {
                alert("Failed to create chat");
            }
        }
    };

    const handleChatClick = (chatId) => {
        // Close any open swipe when clicking on a chat
        setSwipedChat(null);
        setDragOffset(0);
        navigate(`/chat/${chatId}`);
        if (onChatSelect) onChatSelect();
    };

    const handleDeleteChat = (chatId, skipConfirm = false) => {
        const shouldDelete = skipConfirm || window.confirm('¿Estás seguro de que quieres eliminar este chat?');

        if (shouldDelete) {
            try {
                deleteChat(chatId);
                setSwipedChat(null);
                setDragOffset(0);
                fetchChats();
                // If we're currently viewing this chat, navigate to first available chat
                if (window.location.pathname.includes(chatId)) {
                    const remainingChats = getAllChats().filter(c => c.id !== chatId);
                    if (remainingChats.length > 0) {
                        navigate(`/chat/${remainingChats[0].id}`);
                    } else {
                        navigate('/');
                    }
                }
            } catch (error) {
                alert(error.message || 'No se puede eliminar este chat');
            }
        } else {
            setSwipedChat(null);
            setDragOffset(0);
        }
    };

    const handleDragStart = (e, chatId) => {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        setDragStart({ x: clientX, chatId });
    };

    const handleDragMove = (e, chatId) => {
        if (!dragStart || dragStart.chatId !== chatId) return;

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const offset = clientX - dragStart.x;

        // Only allow dragging to the left (negative offset) and limit to -100px
        if (offset < 0 && offset >= -100) {
            setDragOffset(offset);
            setSwipedChat(chatId);
        }
    };

    const handleDragEnd = (chatId) => {
        if (!dragStart) return;

        // If dragged more than 70px to the left, show delete button, otherwise reset
        if (dragOffset < -70) {
            setDragOffset(-100);
            setSwipedChat(chatId);
        } else {
            setDragOffset(0);
            setSwipedChat(null);
        }
        setDragStart(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={createChat} className="btn btn-primary" style={{ width: '100%' }}>
                    <FiPlus style={{ marginRight: '0.5rem' }} /> Nuevo Chat
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                {chats.map(chat => {
                    const isSwiped = swipedChat === chat.id;
                    const currentOffset = isSwiped ? dragOffset : 0;

                    return (
                        <div
                            key={chat.id}
                            style={{
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Delete button background */}
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '100px',
                                    backgroundColor: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    opacity: currentOffset < 0 ? 1 : 0,
                                    transition: currentOffset === -100 ? 'opacity 0.2s' : 'none'
                                }}
                            >
                                <button
                                    onClick={() => handleDeleteChat(chat.id, true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    <FiTrash2 size={20} />
                                    <span style={{ marginTop: '0.25rem' }}>Eliminar</span>
                                </button>
                            </div>

                            {/* Chat item */}
                            <NavLink
                                to={`/chat/${chat.id}`}
                                onClick={() => handleChatClick(chat.id)}
                                onMouseDown={(e) => handleDragStart(e, chat.id)}
                                onMouseMove={(e) => handleDragMove(e, chat.id)}
                                onMouseUp={() => handleDragEnd(chat.id)}
                                onMouseLeave={() => handleDragEnd(chat.id)}
                                onTouchStart={(e) => handleDragStart(e, chat.id)}
                                onTouchMove={(e) => handleDragMove(e, chat.id)}
                                onTouchEnd={() => handleDragEnd(chat.id)}
                                style={({ isActive }) => ({
                                    display: 'block',
                                    padding: '1rem',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                                    backgroundColor: isActive ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                                    position: 'relative',
                                    transform: `translateX(${currentOffset}px)`,
                                    transition: dragStart?.chatId === chat.id ? 'none' : 'transform 0.3s ease',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    touchAction: 'pan-y'
                                })}
                            >
                                <div style={{ fontWeight: 500 }}>{chat.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {chat.last_message || "No messages yet"}
                                </div>
                            </NavLink>
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <img
                        src={user?.picture || user?.profile_pic || 'https://via.placeholder.com/40'}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '0.75rem', objectFit: 'cover' }}
                        alt="Profile"
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                        {user?.is_admin && <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>Admin</div>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setShowProfile(true)} title="Profile">
                        <FiUser />
                    </button>
                    {user?.is_admin && (
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setShowAdmin(true)} title="Admin">
                            <FiSettings />
                        </button>
                    )}
                    <button className="btn btn-secondary" style={{ padding: '0.5rem', marginLeft: 'auto', color: '#ef4444' }} onClick={logout} title="Logout">
                        <FiLogOut />
                    </button>
                </div>
            </div>

            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
            {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
        </div>
    );
}
