import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import {
    Home, Users, BarChart2, Bot, FileText, HelpCircle,
    GraduationCap, Settings, LogOut, Sun, Moon, Search,
    ChevronRight, ChevronDown, BarChart3, FolderOpen, Sparkles, Folder, Palette, Zap
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onNavigate }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Section expansion state - Analytics starts expanded
    const [analyticsOpen, setAnalyticsOpen] = useState(true);

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    // User data - initialized from localStorage
    const [userData] = useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    name: user.displayName || user.name || 'User',
                    role: user.role || 'Admin'
                };
            } catch (error) {
                console.error('Failed to load user data:', error);
            }
        }
        return {
            name: 'User',
            role: 'Admin'
        };
    });

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Keyboard shortcut for search (Cmd/Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                document.getElementById('sidebar-search')?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    // All searchable items (flattened for search)
    const allSearchableItems = [
        { id: 'home', label: t('nav.dashboard', 'Dashboard'), path: '/', icon: Home, keywords: ['home', 'dashboard'] },
        { id: 'smart-follow', label: 'SmartFollow AI', path: '/smart-follow', icon: Sparkles, keywords: ['smart', 'follow', 'crm', 'leads', 'automation'] },
        { id: 'projects', label: t('nav.projects', 'Projects'), path: '/projects', icon: Folder, keywords: ['projects', 'tasks', 'board'] },
        { id: 'users', label: t('nav.team', 'Team & Users'), path: '/users', icon: Users, keywords: ['team', 'users', 'members'] },
        { id: 'automations-hub', label: 'AI Workflows', path: '/automations-hub', icon: Zap, keywords: ['workflows', 'automation'] },
        { id: 'copilots', label: t('copilots.title', 'Co-Pilots'), path: '/copilots', icon: Users, keywords: ['copilots', 'ai', 'assistants', 'chat'] },
        { id: 'documents', label: t('nav.documents', 'Documents'), path: '/documents', icon: FolderOpen, keywords: ['documents', 'files', 'library', 'archive'] },
        { id: 'dashboards', label: t('nav.dashboards', 'Dashboards'), path: '/analytics/dashboards', icon: BarChart3, keywords: ['dashboards', 'analytics', 'charts', 'sql'] },
        { id: 'report-bot', label: t('nav.reportBot', 'Report Bot'), path: '/report-bot', icon: Bot, keywords: ['report', 'bot', 'ai', 'generate'] },
        { id: 'reports-explorer', label: t('nav.reportsExplorer', 'Reports Explorer'), path: '/reports', icon: FileText, keywords: ['reports', 'explorer', 'view'] },
        { id: 'settings', label: t('nav.settings', 'Settings'), path: '/settings', icon: Settings, keywords: ['settings', 'preferences', 'config'] },
    ];

    // Search filtering
    const filteredItems = searchQuery.length > 0
        ? allSearchableItems.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const labelMatch = item.label.toLowerCase().includes(searchLower);
            const keywordMatch = item.keywords.some(kw => kw.includes(searchLower));
            return labelMatch || keywordMatch;
        })
        : [];

    const handleNavigation = (path) => {
        navigate(path);
        setSearchQuery('');
        setIsSearchOpen(false);
        if (onNavigate) onNavigate();
    };

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/assets/logo.png" alt="MicroMind Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                </div>
                <div className="sidebar-branding">
                    <div className="brand-name">MicroMind</div>
                    <div className="product-name">Base Template</div>
                </div>
            </div>

            {/* Command Bar Search */}
            <div className="sidebar-search-container">
                <div className="sidebar-search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input
                        id="sidebar-search"
                        type="text"
                        className="sidebar-search-input"
                        placeholder={t('nav.searchPlaceholder', 'Jump to... (Ctrl+K)')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(e.target.value.length > 0);
                        }}
                        onFocus={() => searchQuery.length > 0 && setIsSearchOpen(true)}
                    />
                </div>

                {/* Search Dropdown */}
                {isSearchOpen && filteredItems.length > 0 && (
                    <div className="search-dropdown">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                className="search-result-item"
                                onClick={() => handleNavigation(item.path)}
                            >
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {/* Home / Dashboard */}
                <button
                    className={`nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/')}
                >
                    <Home size={18} className="nav-icon" />
                    <span className="nav-label">{t('nav.dashboard', 'Dashboard')}</span>
                </button>

                {/* SmartFollow AI */}
                <button
                    className={`nav-item ${isActive('/smart-follow') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/smart-follow')}
                    style={{ background: isActive('/smart-follow') ? 'rgba(224, 170, 62, 0.15)' : undefined, color: isActive('/smart-follow') ? '#E0AA3E' : undefined }}
                >
                    <Sparkles size={18} className="nav-icon" style={{ color: '#E0AA3E' }} />
                    <span className="nav-label" style={{ fontWeight: '600' }}>SmartFollow AI</span>
                </button>

                {/* Projects */}
                <button
                    className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/projects')}
                >
                    <Folder size={18} className="nav-icon" />
                    <span className="nav-label">{t('nav.projects', 'Projects')}</span>
                </button>

                {/* Team & Users */}
                <button
                    className={`nav-item ${isActive('/users') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/users')}
                >
                    <Users size={18} className="nav-icon" />
                    <span className="nav-label">{t('nav.team', 'Team & Users')}</span>
                </button>

                {/* AUTOMATION SECTION */}
                <div className="nav-section">
                    <div className="section-label">{t('nav.automation', 'Automation')}</div>

                    {/* AI Workflows Suite */}
                    <button
                        className={`nav-item ${isActive('/automations-hub') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/automations-hub')}
                    >
                        <Zap size={18} className="nav-icon" />
                        <span className="nav-label">{t('nav.aiWorkflows', 'AI Workflows')}</span>
                    </button>

                    {/* My Co-Pilots */}
                    <button
                        className={`nav-item ${isActive('/copilots') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/copilots')}
                    >
                        <Users size={18} className="nav-icon" />
                        <span className="nav-label">{t('nav.copilots', 'Co-Pilots')}</span>
                    </button>

                    {/* Documents Library */}
                    <button
                        className={`nav-item ${isActive('/documents') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/documents')}
                    >
                        <FolderOpen size={18} className="nav-icon" />
                        <span className="nav-label">{t('nav.documents', 'Documents')}</span>
                    </button>

                    {/* White-Label Branding Hub */}
                    <button
                        className={`nav-item ${isActive('/branding-hub') ? 'active' : ''}`}
                        onClick={() => handleNavigation('/branding-hub')}
                    >
                        <Palette size={18} className="nav-icon" />
                        <span className="nav-label">{t('nav.whiteLabelHub', 'White-Label Hub')}</span>
                    </button>
                </div>

                {/* ANALYTICS SECTION */}
                <div className="nav-section">
                    <div className="section-label">{t('nav.analytics', 'Analytics')}</div>

                    {/* Analytics Sub-menu (Collapsible) */}
                    <button
                        className="nav-item nav-item-parent"
                        onClick={() => setAnalyticsOpen(!analyticsOpen)}
                    >
                        <BarChart2 size={18} className="nav-icon" />
                        <span className="nav-label">{t('nav.analytics', 'Analytics')}</span>
                        {analyticsOpen ? <ChevronDown size={16} className="chevron" /> : <ChevronRight size={16} className="chevron" />}
                    </button>

                    {/* Analytics Sub-items */}
                    {analyticsOpen && (
                        <div className="nav-sub-items">
                            <button
                                className={`nav-item nav-sub-item ${isActive('/analytics/dashboards') ? 'active' : ''}`}
                                onClick={() => handleNavigation('/analytics/dashboards')}
                            >
                                <BarChart3 size={16} className="nav-icon" />
                                <span className="nav-label">{t('nav.dashboards', 'Dashboards')}</span>
                            </button>
                            <button
                                className={`nav-item nav-sub-item ${isActive('/report-bot') ? 'active' : ''}`}
                                onClick={() => handleNavigation('/report-bot')}
                            >
                                <Bot size={16} className="nav-icon" />
                                <span className="nav-label">{t('nav.reportBot', 'Report Bot')}</span>
                            </button>
                            <button
                                className={`nav-item nav-sub-item ${isActive('/reports') ? 'active' : ''}`}
                                onClick={() => handleNavigation('/reports')}
                            >
                                <FileText size={16} className="nav-icon" />
                                <span className="nav-label">{t('nav.reportsExplorer', 'Reports Explorer')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="footer-links" style={{ padding: '8px 12px', borderBottom: 'none' }}>
                    <LanguageSwitcher />
                </div>
                {/* System Links */}
                <div className="footer-links">
                    <button className="footer-link" onClick={() => handleNavigation('/docs')}>
                        <HelpCircle size={16} />
                        <span>{t('nav.documentation', 'Documentation')}</span>
                    </button>
                    <button className="footer-link" onClick={() => handleNavigation('/campus')}>
                        <GraduationCap size={16} />
                        <span>{t('nav.campus', 'Campus')}</span>
                    </button>
                </div>

                {/* User Plate */}
                <div className="user-plate">
                    <div className="user-info">
                        <div className="user-avatar">
                            {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{userData.name}</div>
                            <div className="user-role">{userData.role}</div>
                        </div>
                    </div>

                    {/* Control Cluster */}
                    <div className="control-cluster">
                        <button
                            className="control-btn"
                            onClick={toggleTheme}
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button
                            className="control-btn"
                            onClick={() => navigate('/settings')}
                            title="Settings"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            className="control-btn"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
