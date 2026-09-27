import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, X, Sun, Moon } from 'lucide-react';

/**
 * AppLayout - Main application shell with full Mobile/Tablet & Desktop responsiveness
 */
const AppLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'var(--bg-page, #0F0F0F)',
        }}>
            {/* Mobile Header Bar (Visible on Mobile & Tablet < 768px) */}
            <header className="mobile-header" style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-surface, #1C1C1C)',
                borderBottom: '1px solid var(--border, #333)',
                position: 'sticky',
                top: 0,
                zIndex: 1100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <img src="/assets/logo.png" alt="MicroMind" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    <span style={{ fontWeight: 700, color: 'var(--primary, #E0AA3E)', fontSize: '15px' }}>MicroMind</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LanguageSwitcher />
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'var(--bg-card, #262626)',
                            border: '1px solid var(--border, #444)',
                            borderRadius: '6px',
                            color: 'var(--primary, #E0AA3E)',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                {/* Sidebar Drawer */}
                <div className={`sidebar-wrapper ${mobileOpen ? 'mobile-show' : ''}`}>
                    <Sidebar onNavigate={() => setMobileOpen(false)} />
                </div>

                {/* Backdrop overlay for mobile drawer */}
                {mobileOpen && (
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(3px)',
                            zIndex: 999,
                        }}
                    />
                )}

                {/* Main Content Area */}
                <main className="main-content" style={{
                    flex: 1,
                    marginInlineStart: '240px',
                    padding: '24px',
                    overflowY: 'auto',
                    minWidth: 0,
                }}>
                    <Outlet />
                </main>
            </div>

            {/* CSS for Responsive Mobile Layout */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-header {
                        display: flex !important;
                    }
                    .main-content {
                        margin-inline-start: 0 !important;
                        padding: 16px !important;
                    }
                    .sidebar-wrapper {
                        position: fixed;
                        top: 56px;
                        bottom: 0;
                        left: 0;
                        z-index: 1050;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    [dir="rtl"] .sidebar-wrapper {
                        left: auto;
                        right: 0;
                        transform: translateX(100%);
                    }
                    .sidebar-wrapper.mobile-show {
                        transform: translateX(0) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AppLayout;

