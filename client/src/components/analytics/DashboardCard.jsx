import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Trash2, Cpu, Zap, Activity } from 'lucide-react';
import { MMBadge } from '../../sdk';

/**
 * DashboardCard - Displays a dashboard summary card with metrics & delete action
 */
const DashboardCard = ({ dashboard, onDelete }) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    return (
        <div style={{
            background: 'var(--bg-component, #1C1C1C)',
            border: '1px solid var(--border-subtle, #333)',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s ease',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E0AA3E';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(224, 170, 62, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle, #333)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(224, 170, 62, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={20} style={{ color: '#E0AA3E' }} />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-primary, #F2F3EC)', fontSize: '1.05rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dashboard?.title || t('dashboardsPage.empty.title')}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #888)' }}>
                            {dashboard?.category || 'AI Intelligence Layer'}
                        </span>
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        title={t('common.delete')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted, #666)',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted, #666)'}
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <p style={{ color: 'var(--text-secondary, #888)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5', flex: 1 }}>
                {dashboard?.description || t('dashboardsPage.noDescription', 'No description')}
            </p>

            {/* Display KPI Stats if available */}
            {dashboard?.stats && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    {Object.entries(dashboard.stats).map(([key, val], idx) => (
                        <span key={idx} style={{ padding: '4px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {val}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer Metadata */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} style={{ color: '#E0AA3E' }} />
                    {dashboard?.autoSyncFrequency || 'Real-time'}
                </span>
                <MMBadge variant="primary" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {isArabic ? 'طبقة ذكاء نشطة' : 'Active Intel Layer'}
                </MMBadge>
            </div>
        </div>
    );
};

export default DashboardCard;
