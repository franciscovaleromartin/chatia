import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import AdminModal from './AdminModal';
import { getAllChats, createChat as createMockChat } from '../mockData';

export default function Sidebar({ refreshTrigger, onChatSelect }) {
    const { user, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
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
        navigate(`/chat/${chatId}`);
        if (onChatSelect) onChatSelect();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={createChat} className="btn btn-primary" style={{ width: '100%' }}>
                    <FiPlus style={{ marginRight: '0.5rem' }} /> New Chat
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {chats.map(chat => (
                    <NavLink
                        key={chat.id}
                        to={`/chat/${chat.id}`}
                        onClick={() => handleChatClick(chat.id)}
                        style={({ isActive }) => ({
                            display: 'block',
                            padding: '1rem',
                            textDecoration: 'none',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                            backgroundColor: isActive ? 'var(--color-surface-hover)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent'
                        })}
                    >
                        <div style={{ fontWeight: 500 }}>{chat.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {chat.last_message || "No messages yet"}
                        </div>
                    </NavLink>
                ))}
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
