import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MMCard } from '@sdk';
import { TrendingUp, Users, FileText, Activity, Sparkles, BarChart3, Upload, Bot, FileCheck } from 'lucide-react';

function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const kpis = [
        {
            label: t('home.kpis.totalUsers', 'Total Users'),
            value: '1,234',
            icon: Users,
            trend: '+12%',
            color: 'var(--primary)'
        },
        {
            label: t('home.kpis.activeSessions', 'Active Sessions'),
            value: '89',
            icon: Activity,
            trend: '+5%',
            color: 'var(--success)'
        },
        {
            label: t('home.kpis.documents', 'Documents'),
            value: '456',
            icon: FileText,
            trend: '+23%',
            color: 'var(--info)'
        },
        {
            label: t('home.kpis.systemHealth', 'System Health'),
            value: '98%',
            icon: TrendingUp,
            trend: t('home.kpis.stable', 'Stable'),
            color: 'var(--primary)'
        }
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {t('home.welcome', 'Welcome')}{user ? `, ${user.displayName || user.name}` : ''}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {t('home.subtitle', "Here's your overview for today.")}
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <MMCard key={index} className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        {kpi.label}
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        {kpi.value}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: kpi.color }}>
                                        {kpi.trend}
                                    </div>
                                </div>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `${kpi.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={24} style={{ color: kpi.color }} />
                                </div>
                            </div>
                        </MMCard>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <MMCard style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {t('home.quickActions.title', 'Quick Actions')}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button 
                        className="quick-action-btn"
                        onClick={() => navigate('/smart-follow')}
                        style={{ border: '1px solid var(--primary)', background: 'rgba(224, 170, 62, 0.1)' }}
                    >
                        <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                        <span>{t('home.quickActions.smartFollow', 'SmartFollow AI')}</span>
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => navigate('/analytics/dashboards')}
                    >
                        <BarChart3 size={18} />
                        <span>{t('home.quickActions.viewDashboards', 'View Dashboards')}</span>
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => navigate('/documents')}
                    >
                        <Upload size={18} />
                        <span>{t('home.quickActions.uploadDocument', 'Upload Document')}</span>
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => navigate('/copilots')}
                    >
                        <Bot size={18} />
                        <span>{t('home.quickActions.askCopilot', 'Ask Co-Pilot')}</span>
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => navigate('/report-bot')}
                    >
                        <FileCheck size={18} />
                        <span>{t('home.quickActions.generateReport', 'Generate Report')}</span>
                    </button>
                </div>
            </MMCard>

            <style>{`
        .kpi-card {
          transition: transform 0.2s ease;
        }
        .kpi-card:hover {
          transform: translateY(-2px);
        }
        .quick-action-btn {
          padding: 1rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color, var(--border));
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }
        .quick-action-btn:hover {
          background: var(--bg-hover);
          border-color: var(--primary);
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
}

export default HomePage;
