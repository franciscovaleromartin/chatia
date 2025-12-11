import React, { useState, useEffect } from 'react';

export default function AdminModal({ onClose }) {
    const [settings, setSettings] = useState({ ai_frequency: 5, ai_personality: 'Helpful and polite' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('chatia_admin_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        setLoading(false);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            localStorage.setItem('chatia_admin_settings', JSON.stringify(settings));
            setTimeout(() => {
                setSaving(false);
                onClose();
            }, 300);
        } catch (err) {
            alert('Error updating settings');
            setSaving(false);
        }
    };

    if (loading) return <div />;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)',
                width: '400px', maxWidth: '90%'
            }}>
                <h2 style={{ marginTop: 0 }}>Admin Settings</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>AI Frequency (msgs)</label>
                        <input
                            type="number"
                            className="input"
                            value={settings.ai_frequency}
                            onChange={e => setSettings({ ...settings, ai_frequency: e.target.value })}
                            required
                        />
                        <small style={{ color: 'var(--color-text-muted)' }}>AI replies after this many messages.</small>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>AI Personality</label>
                        <select
                            className="input"
                            value={settings.ai_personality}
                            onChange={e => setSettings({ ...settings, ai_personality: e.target.value })}
                        >
                            <option value="Helpful and polite">Helpful and polite</option>
                            <option value="Gracioso">Gracioso</option>
                            <option value="Inteligente">Inteligente</option>
                            <option value="Pasota">Pasota</option>
                            <option value="Ingenioso">Ingenioso</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Save' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
