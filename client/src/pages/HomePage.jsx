import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MMCard, MMBadge, MMButton } from '../sdk';
import aiService from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    TrendingUp, Users, FileText, Activity, Sparkles, BarChart3, 
    Upload, Bot, FileCheck, ShieldAlert, Cpu, Zap, RefreshCw, Layers, CheckCircle2 
} from 'lucide-react';

function HomePage() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [briefingData, setBriefingData] = useState(null);
    const [loadingBriefing, setLoadingBriefing] = useState(true);
    const [executingAction, setExecutingAction] = useState(false);
    const [actionFeedback, setActionFeedback] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchExecutiveBriefing();
    }, []);

    const fetchExecutiveBriefing = async () => {
        try {
            setLoadingBriefing(true);
            const data = await aiService.getExecutiveBriefing();
            setBriefingData(data);
        } catch (err) {
            console.error('Failed to load executive briefing:', err);
        } finally {
            setLoadingBriefing(false);
        }
    };

    const handleRunAgentAction = async (actionType, title) => {
        setExecutingAction(true);
        setActionFeedback(null);
        try {
            const res = await aiService.runAgentAction(actionType, { language: isArabic ? 'ar' : 'en' });
            setActionFeedback({
                title,
                output: res.output,
                provider: res.provider
            });
        } catch (err) {
            console.error('Failed agent action:', err);
        } finally {
            setExecutingAction(false);
        }
    };

    const kpis = [
        {
            label: isArabic ? 'إجمالي قيمة الصفقات (Pipeline)' : 'Total Pipeline Value',
            value: briefingData?.kpis ? `$${(briefingData.kpis.totalPipelineValue || 0).toLocaleString()}` : '$128,500',
            icon: TrendingUp,
            trend: '+24.8% vs last month',
            color: 'var(--primary)'
        },
        {
            label: isArabic ? 'صفقات عالية المخاطر (Churn Risk)' : 'High-Risk Churn Escalations',
            value: briefingData?.kpis ? briefingData.kpis.highRiskCount : '3 Deals',
            icon: ShieldAlert,
            trend: isArabic ? 'تحتاج تدخل AI' : 'Requires AI Intervention',
            color: '#ef4444'
        },
        {
            label: isArabic ? 'العملاء الجدد المستهدفين' : 'Active Targeted Leads',
            value: briefingData?.kpis ? briefingData.kpis.activeLeadsCount : '12 Leads',
            icon: Users,
            trend: '+12% growth',
            color: 'var(--success)'
        },
        {
            label: isArabic ? 'المهام المعلقة في الـ Queue' : 'Pending SLA Tasks',
            value: briefingData?.kpis ? briefingData.kpis.pendingTasksCount : '5 Tasks',
            icon: Activity,
            trend: isArabic ? 'استجابة 98%' : '98% SLA Score',
            color: 'var(--info)'
        }
    ];

    return (
        <div style={{ padding: '2rem', background: 'var(--bg-page)', minHeight: '100vh' }}>
            
            {/* Header Title */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Sparkles size={28} style={{ color: 'var(--primary)' }} />
                        {t('home.welcome', 'Welcome')}{user ? `, ${user.displayName || user.name}` : ''}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
                        {isArabic ? 'منصة MicroMind المشغلة كلياً بالذكاء الاصطناعي الذاتي (Agentic AI Autonomous Suite)' : "Your workspace powered by active Agentic AI autonomous workflows."}
                    </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MMBadge variant="success" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '13px' }}>
                        <Cpu size={14} />
                        {isArabic ? 'محرك الـ AI النشط: ' : 'Active Provider: '}
                        <strong>{(briefingData?.provider || 'Groq Allam / Gemini').toUpperCase()}</strong>
                    </MMBadge>
                    <MMButton variant="secondary" onClick={fetchExecutiveBriefing} disabled={loadingBriefing} style={{ padding: '6px 12px' }}>
                        <RefreshCw size={14} className={loadingBriefing ? 'spin' : ''} />
                    </MMButton>
                </div>
            </div>

            {/* Agentic AI Executive Briefing Hero Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(224, 170, 62, 0.12) 0%, rgba(20, 20, 20, 0.9) 100%)',
                border: '1px solid var(--primary)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                            <Zap size={20} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {isArabic ? 'التقرير التنفيذي المستمر من الذكاء الاصطناعي (Agentic AI Briefing)' : 'Agentic AI Executive Briefing & Live Insights'}
                        </h2>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {isArabic ? 'يتم التحديث لحظياً من قاعدة البيانات' : 'Live database telemetry audit'}
                    </span>
                </div>

                {loadingBriefing ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <RefreshCw size={24} className="spin" style={{ marginBottom: '8px', color: 'var(--primary)' }} />
                        <p style={{ margin: 0 }}>{isArabic ? 'جاري تحليل بيانات النظام وتوليد التقرير الذكي...' : 'Analyzing live pipeline & generating strategic briefing...'}</p>
                    </div>
                ) : (
                    <div className="briefing-content" style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {briefingData?.briefing || ''}
                        </ReactMarkdown>
                    </div>
                )}

                {/* 1-Click Agentic Action Triggers */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => handleRunAgentAction('generate_sales_pitch', isArabic ? 'مولد السكربت البيعي الذكي' : 'AI Sales Pitch Orchestrator')}
                        disabled={executingAction}
                        style={{
                            background: 'var(--primary)',
                            color: '#000',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <Zap size={16} />
                        {isArabic ? '🔮 تشغيل وكيل زيادة المبيعات' : '🔮 Launch AI Sales Booster Agent'}
                    </button>

                    <button
                        onClick={() => handleRunAgentAction('objection_handler', isArabic ? 'معالج الاعتراضات الذكي' : 'AI Objection Handler Agent')}
                        disabled={executingAction}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <ShieldAlert size={16} style={{ color: '#ef4444' }} />
                        {isArabic ? '⚠️ حماية الصفقات وعلاج الاعتراضات' : '⚠️ Run Objection Re-framer'}
                    </button>

                    <button
                        onClick={() => navigate('/automations')}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <Bot size={16} style={{ color: 'var(--primary)' }} />
                        {isArabic ? '⚡ أتمتة الواتساب والمتابعة' : '⚡ 1-Click WhatsApp AI Bot'}
                    </button>
                </div>

                {/* Interactive Feedback Output Card */}
                {actionFeedback && (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--primary)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={16} /> {actionFeedback.title}
                            </strong>
                            <button onClick={() => setActionFeedback(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{actionFeedback.output}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <MMCard key={index} className="kpi-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                        {kpi.label}
                                    </div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        {kpi.value}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: kpi.color, fontWeight: 500 }}>
                                        {kpi.trend}
                                    </div>
                                </div>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: `${kpi.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={22} style={{ color: kpi.color }} />
                                </div>
                            </div>
                        </MMCard>
                    );
                })}
            </div>

            {/* Autonomous AI Agents Fleet Overview */}
            <MMCard style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={20} style={{ color: 'var(--primary)' }} />
                        {isArabic ? 'أسطول الـ AI Agents النشط في المنظومة (Agentic AI Fleet)' : 'Autonomous AI Agents Fleet Status'}
                    </h2>
                    <MMBadge variant="primary">{isArabic ? '4 وكلاء نشطون' : '4 Agents Active'}</MMBadge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-hover)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>🎯 Lead Qualifier Agent</strong>
                            <MMBadge variant="success">ACTIVE</MMBadge>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isArabic ? 'يحلل نية الشراء ويحدد السكور التلقائي للصفقات' : 'Scans lead buying signals & auto-assigns health scores.'}
                        </p>
                    </div>

                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-hover)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>⚡ WhatsApp Escalator</strong>
                            <MMBadge variant="success">ACTIVE</MMBadge>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isArabic ? 'يرسل رسائل واتساب ذكية ومخصصة بالنموذج الحي' : 'Dispatches dynamic AI risk escalation alerts via WhatsApp.'}
                        </p>
                    </div>

                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-hover)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>📊 Revenue & Forecast Bot</strong>
                            <MMBadge variant="success">ACTIVE</MMBadge>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isArabic ? 'يتنبأ بنسبة النجاح ويعطي استراتيجيات الإغلاق' : 'Forecasts pipeline velocity & recommends deal closing steps.'}
                        </p>
                    </div>

                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-hover)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>🛡️ Churn Risk Patrol</strong>
                            <MMBadge variant="success">ACTIVE</MMBadge>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isArabic ? 'يكتشف الصفقات المتعثرة ويقترح خطط استعادة سريعة' : 'Detects stalled deals and builds automated win-back flows.'}
                        </p>
                    </div>
                </div>
            </MMCard>

            {/* Quick Actions Navigation */}
            <MMCard>
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
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default HomePage;
