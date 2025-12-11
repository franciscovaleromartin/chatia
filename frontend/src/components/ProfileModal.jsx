import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ onClose }) {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [pic, setPic] = useState(user?.picture || user?.profile_pic || '');
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatedUser = { ...user, name, picture: pic };
            localStorage.setItem('chatia_demo_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setTimeout(() => {
                setSaving(false);
                onClose();
            }, 300);
        } catch (err) {
            alert('Error updating profile');
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)',
                width: '400px', maxWidth: '90%'
            }}>
                <h2 style={{ marginTop: 0 }}>Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Display Name</label>
                        <input
                            className="input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Profile Picture URL</label>
                        <input
                            className="input"
                            value={pic}
                            onChange={e => setPic(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
