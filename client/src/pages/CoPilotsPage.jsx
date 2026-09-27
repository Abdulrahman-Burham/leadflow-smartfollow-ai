import React, { useState } from 'react';
import AIAgentChat from '../components/AIAgentChat';
import { useTranslation } from 'react-i18next';
import { Target, DollarSign, ShieldAlert, Cpu, Sparkles, Bot, Zap } from 'lucide-react';
import { MMCard, MMBadge } from '../sdk';

const CoPilotsPage = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [selectedAgent, setSelectedAgent] = useState('sales');

    const agents = [
        {
            id: 'sales',
            title: isArabic ? '🎯 وكيل زيادة المبيعات والصفقات' : '🎯 Sales Strategy Agent',
            subtitle: isArabic ? 'صياغة العروض، معالجة الاعتراضات، وتحديد سكور الصفقات' : 'Deal closing, pitch scripts, and objection re-framing.',
            icon: Target,
            badge: 'GROQ ALLAM-2-7B',
            color: 'var(--primary)'
        },
        {
            id: 'finance',
            title: isArabic ? '📊 وكيل المحصل والتحصيل المالي' : '📊 Financial & Cash Collector Agent',
            subtitle: isArabic ? 'إدارة التحصيل، متابعات المدفوعات، وتقليل الديون' : 'Payment follow-ups, cash collection, & debt restructuring.',
            icon: DollarSign,
            badge: 'GEMINI 2.5 FLASH',
            color: 'var(--success-color)'
        },
        {
            id: 'retention',
            title: isArabic ? '🛡️ وكيل منع إلغاء الاشتراكات (Churn Patrol)' : '🛡️ Churn Prevention & Retention Agent',
            subtitle: isArabic ? 'اكتشاف الصفقات المتعثرة وتوليد خطط استعادة سريعة' : 'Stalled deal recovery, customer sentiment, & churn prevention.',
            icon: ShieldAlert,
            badge: 'OPENROUTER LLAMA 3.3',
            color: '#ef4444'
        },
        {
            id: 'ops',
            title: isArabic ? '⚙️ وكيل إدارة العمليات والمشاريع' : '⚙️ Operations & PM Specialist',
            subtitle: isArabic ? 'تفكيك المهام، توزيع الأحمال، وضمان الـ SLA' : 'Task breakdown, team capacity, and SLA compliance.',
            icon: Cpu,
            badge: 'MICROMIND CORE',
            color: 'var(--info-color)'
        }
    ];

    return (
        <div className="dashboard-container" style={{ paddingBottom: '2rem', background: 'var(--bg-page)', minHeight: '100vh' }}>
            <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Bot size={32} style={{ color: 'var(--primary)' }} />
                                {isArabic ? 'مركز وكلاء الذكاء الاصطناعي المتخصصين (AI Co-Pilots Hub)' : t('copilots.title')}
                            </h1>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                {isArabic ? 'اختر الوكيل الذكي المتخصص لمساعدتك في اتخاذ القرارات وإنجاز الأتمتة لحظياً.' : t('copilots.subtitle')}
                            </p>
                        </div>

                        <MMBadge variant="primary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={16} />
                            {isArabic ? '4 وكلاء متوفرون بحرية' : '4 Specialized Agents Ready'}
                        </MMBadge>
                    </div>
                </div>

                {/* Specialized Agents Selection Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {agents.map((agent) => {
                        const Icon = agent.icon;
                        const isSelected = selectedAgent === agent.id;
                        return (
                            <div 
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent.id)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: isSelected ? 'linear-gradient(135deg, rgba(224, 170, 62, 0.15) 0%, rgba(20, 20, 20, 0.8) 100%)' : 'var(--bg-surface)',
                                    border: isSelected ? `2px solid ${agent.color}` : '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.2)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={22} style={{ color: agent.color }} />
                                    </div>
                                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        {agent.badge}
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                    {agent.title}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                    {agent.subtitle}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* AI Agent Chat Component */}
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                    <AIAgentChat key={selectedAgent} agentScope={selectedAgent} />
                </div>
            </div>
        </div>
    );
};

export default CoPilotsPage;
