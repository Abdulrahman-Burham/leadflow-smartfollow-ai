import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MMCard, MMButton } from '@sdk';
import { User, Mail, Globe, Moon, Sun, Bell, Shield, Key, Cpu, Eye, EyeOff, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

function SettingsPage() {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState({
        displayName: '',
        email: '',
        language: i18n.language || 'en',
        theme: localStorage.getItem('theme') || 'dark',
        notifications: true,
        twoFactor: false
    });

    // AI LLM API Integration State
    const [aiConfig, setAiConfig] = useState({
        provider: 'groq',
        apiKey: '',
        model: 'llama-3.3-70b-versatile',
        baseUrl: 'https://dev.aimicromind.com',
        isConfigured: false,
        maskedKey: ''
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // { loading: boolean, success: boolean, message: string }

    useEffect(() => {
        const user = localStorage.getItem('user');
        const theme = localStorage.getItem('theme') || 'dark';
        const language = localStorage.getItem('language') || i18n.language || 'en';

        if (user) {
            try {
                const userData = JSON.parse(user);
                setSettings(prev => ({
                    ...prev,
                    displayName: userData.displayName || userData.name || '',
                    email: userData.email || '',
                    theme,
                    language
                }));
            } catch (e) {
                console.error('Failed to parse user data', e);
            }
        }

        // Fetch live AI Configuration
        fetch('/api/v1/ai/config')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setAiConfig(prev => ({
                        ...prev,
                        provider: data.provider || 'groq',
                        model: data.model || 'llama-3.3-70b-versatile',
                        isConfigured: data.isConfigured || false,
                        maskedKey: data.maskedKey || '',
                        baseUrl: data.baseUrl || 'https://dev.aimicromind.com'
                    }));
                }
            })
            .catch(err => console.warn('Could not fetch AI config:', err));
    }, [i18n.language]);

    const handleLanguageChange = (newLang) => {
        setSettings(prev => ({ ...prev, language: newLang }));
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const handleSave = async () => {
        localStorage.setItem('theme', settings.theme);
        localStorage.setItem('language', settings.language);
        i18n.changeLanguage(settings.language);

        // Update stored user display name if changed
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                userObj.displayName = settings.displayName;
                userObj.email = settings.email;
                localStorage.setItem('user', JSON.stringify(userObj));
            } catch (e) {}
        }

        document.documentElement.setAttribute('data-theme', settings.theme);

        // Save AI Configuration to Backend
        try {
            const res = await fetch('/api/v1/ai/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: aiConfig.provider,
                    apiKey: aiConfig.apiKey,
                    model: aiConfig.model,
                    baseUrl: aiConfig.baseUrl
                })
            });
            const data = await res.json();
            if (data.success) {
                setAiConfig(prev => ({
                    ...prev,
                    isConfigured: data.config.isConfigured,
                    model: data.config.model
                }));
            }
        } catch (e) {
            console.error('Error saving AI settings:', e);
        }

        alert(t('settingsPage.savedSuccess'));
    };

    const handleThemeToggle = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        setSettings(prev => ({ ...prev, theme: newTheme }));
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleTestAiConnection = async () => {
        setTestStatus({ loading: true, message: t('settingsPage.aiEngine.testing') });

        try {
            const res = await fetch('/api/v1/ai/test-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: aiConfig.provider,
                    apiKey: aiConfig.apiKey,
                    model: aiConfig.model,
                    baseUrl: aiConfig.baseUrl
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setTestStatus({
                    loading: false,
                    success: true,
                    message: data.message || t('settingsPage.aiEngine.statusConnected')
                });
            } else {
                setTestStatus({
                    loading: false,
                    success: false,
                    message: data.message || t('settingsPage.aiEngine.statusFailed')
                });
            }
        } catch (e) {
            setTestStatus({
                loading: false,
                success: false,
                message: t('settingsPage.aiEngine.statusFailed') + ' (' + e.message + ')'
            });
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {t('settingsPage.title')}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                {t('settingsPage.subtitle')}
            </p>

            {/* AI Engine & LLM API Integration Card */}
            <MMCard style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid var(--primary-glow, #3b82f6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Cpu size={22} color="var(--primary)" />
                        {t('settingsPage.aiEngine.title')}
                    </h2>

                    <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backgroundColor: aiConfig.isConfigured ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: aiConfig.isConfigured ? '#22c55e' : '#eab308',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        {aiConfig.isConfigured ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        {aiConfig.isConfigured ? t('settingsPage.aiEngine.modeExternal') : t('settingsPage.aiEngine.modeLocal')}
                    </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {t('settingsPage.aiEngine.subtitle')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Provider Select */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            {t('settingsPage.aiEngine.provider')}
                        </label>
                        <select
                            value={aiConfig.provider}
                            onChange={(e) => {
                                const prov = e.target.value;
                                let defaultModel = 'llama-3.3-70b-versatile';
                                if (prov === 'openai') defaultModel = 'gpt-4o-mini';
                                if (prov === 'gemini') defaultModel = 'gemini-1.5-flash';
                                if (prov === 'micromind') defaultModel = 'micromind-core-v1';
                                if (prov === 'local') defaultModel = 'sqlite-analytics';
                                setAiConfig(prev => ({ ...prev, provider: prov, model: defaultModel }));
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem',
                                fontWeight: 500
                            }}
                        >
                            <option value="groq">⚡ Groq API (Llama 3.3 70B - Free & Super Fast)</option>
                            <option value="openai">🤖 OpenAI (GPT-4o / GPT-4o-mini)</option>
                            <option value="gemini">✨ Google Gemini (Gemini 1.5 Flash / Pro)</option>
                            <option value="micromind">🧠 MicroMind Core Engine API</option>
                            <option value="local">💻 Intelligent Local Engine (SQLite Offline Analytics)</option>
                        </select>
                    </div>

                    {/* API Key Input (if not local) */}
                    {aiConfig.provider !== 'local' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('settingsPage.aiEngine.apiKey')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={aiConfig.apiKey}
                                    placeholder={aiConfig.maskedKey ? `Current Key: ${aiConfig.maskedKey}` : t('settingsPage.aiEngine.apiKeyPlaceholder')}
                                    onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingEnd: '2.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-surface)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9375rem',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '0.75rem',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Model Name Input */}
                    {aiConfig.provider !== 'local' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('settingsPage.aiEngine.model')}
                            </label>
                            <input
                                type="text"
                                value={aiConfig.model}
                                placeholder={t('settingsPage.aiEngine.modelPlaceholder')}
                                onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9375rem'
                                }}
                            />
                        </div>
                    )}

                    {/* Test Connection Button & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <MMButton
                            variant="secondary"
                            onClick={handleTestAiConnection}
                            disabled={testStatus && testStatus.loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {testStatus && testStatus.loading ? <RefreshCw size={16} className="spin" /> : <Cpu size={16} />}
                            {t('settingsPage.aiEngine.testBtn')}
                        </MMButton>

                        {testStatus && (
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: testStatus.success ? '#22c55e' : (testStatus.loading ? 'var(--text-muted)' : '#ef4444'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                {testStatus.success ? <CheckCircle2 size={16} /> : (!testStatus.loading && <AlertTriangle size={16} />)}
                                {testStatus.message}
                            </span>
                        )}
                    </div>
                </div>
            </MMCard>

            {/* Profile Section */}
            <MMCard style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} />
                    {t('settingsPage.profile.title')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            {t('settingsPage.profile.displayName')}
                        </label>
                        <input
                            type="text"
                            value={settings.displayName}
                            onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <Mail size={16} style={{ display: 'inline', marginEnd: '0.5rem' }} />
                            {t('settingsPage.profile.email')}
                        </label>
                        <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem'
                            }}
                        />
                    </div>
                </div>
            </MMCard>

            {/* Appearance Section */}
            <MMCard style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    {t('settingsPage.appearance.title')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                {t('settingsPage.appearance.theme')}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {t('settingsPage.appearance.themeDesc')}
                            </div>
                        </div>
                        <button
                            onClick={handleThemeToggle}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--primary)',
                                backgroundColor: 'transparent',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 600
                            }}
                        >
                            {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            {settings.theme === 'dark' ? t('settingsPage.appearance.light') : t('settingsPage.appearance.dark')}
                        </button>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <Globe size={16} style={{ display: 'inline', marginEnd: '0.5rem' }} />
                            {t('settingsPage.appearance.language')}
                        </label>
                        <select
                            value={settings.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem'
                            }}
                        >
                            <option value="en">English (English)</option>
                            <option value="ar">العربية (Arabic)</option>
                            <option value="fr">Français (French)</option>
                            <option value="de">Deutsch (German)</option>
                            <option value="sw">Kiswahili (Swahili)</option>
                        </select>
                    </div>
                </div>
            </MMCard>

            {/* Notifications Section */}
            <MMCard style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={20} />
                    {t('settingsPage.notifications.title')}
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            {t('settingsPage.notifications.push')}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {t('settingsPage.notifications.pushDesc')}
                        </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: settings.notifications ? 'var(--primary)' : 'var(--border)',
                            transition: '0.4s',
                            borderRadius: '24px'
                        }}>
                            <span style={{
                                position: 'absolute',
                                content: '',
                                height: '18px',
                                width: '18px',
                                left: settings.notifications ? '26px' : '3px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: '0.4s',
                                borderRadius: '50%'
                            }} />
                        </span>
                    </label>
                </div>
            </MMCard>

            {/* Security Section */}
            <MMCard style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} />
                    {t('settingsPage.security.title')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                {t('settingsPage.security.twoFactor')}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {t('settingsPage.security.twoFactorDesc')}
                            </div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                            <input
                                type="checkbox"
                                checked={settings.twoFactor}
                                onChange={(e) => setSettings(prev => ({ ...prev, twoFactor: e.target.checked }))}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: settings.twoFactor ? 'var(--primary)' : 'var(--border)',
                                transition: '0.4s',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '',
                                    height: '18px',
                                    width: '18px',
                                    left: settings.twoFactor ? '26px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '0.4s',
                                    borderRadius: '50%'
                                }} />
                            </span>
                        </label>
                    </div>

                    <button
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            width: 'fit-content'
                        }}
                    >
                        <Key size={16} />
                        {t('settingsPage.security.changePassword')}
                    </button>
                </div>
            </MMCard>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <MMButton variant="secondary">
                    {t('settingsPage.buttons.cancel')}
                </MMButton>
                <MMButton onClick={handleSave}>
                    {t('settingsPage.buttons.save')}
                </MMButton>
            </div>
        </div>
    );
}

export default SettingsPage;
