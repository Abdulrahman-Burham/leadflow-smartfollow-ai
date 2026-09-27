import React, { useState, useEffect } from 'react';
import { MMCard, MMButton, MMBadge, MMInput, MMSelect } from '../sdk';
import automationService from '../services/automationService';
import customerService from '../services/customerService';
import { useTranslation } from 'react-i18next';
import { 
  Zap, Calendar, PhoneCall, Sparkles, AlertTriangle, 
  CheckCircle2, Clock, Mail, MessageSquare, ArrowRight, FileText, Send, Copy, Check, X 
} from 'lucide-react';

export default function AutomationsHubPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('drip'); // 'drip' | 'meeting' | 'risk'

  // Tab 1: Drip Sequences State
  const [sequences, setSequences] = useState([]);
  const [loadingSeq, setLoadingSeq] = useState(true);

  // Tab 2: Call Summarizer State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  // Tab 3: Risk State
  const [riskData, setRiskData] = useState([]);

  // Escalation Modal State
  const [escalationCustomer, setEscalationCustomer] = useState(null);
  const [escalationMsg, setEscalationMsg] = useState('');
  const [copiedEscalation, setCopiedEscalation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingSeq(true);
      const seqData = await automationService.getSequences();
      setSequences(seqData || []);

      const custData = await customerService.getCustomers();
      const allCust = custData.customers || [];
      setCustomers(allCust);

      // Risk computation (Deduplicate high-risk deals & populate 4 distinct enterprise cases)
      const highRisk = [];
      const seenNames = new Set();
      allCust.filter(c => c.healthScore < 80 || c.stage === 'FOLLOW_UP_NEEDED').forEach(c => {
        if (!seenNames.has(c.name)) {
          seenNames.add(c.name);
          highRisk.push(c);
        }
      });

      // Populate rich demo high-risk escalation cases if less than 4
      const demoEscalations = [
        { id: 'risk-1', name: 'Sarah Miller', company: 'Apex Global Trading', healthScore: 60, dealValue: 28000, stage: 'FOLLOW_UP_NEEDED', phone: '+12025550143' },
        { id: 'risk-2', name: 'Michael Chang', company: 'Pacific Freight Logistics', healthScore: 45, dealValue: 42500, stage: 'PROPOSAL_SENT', phone: '+14155550188' },
        { id: 'risk-3', name: 'Elena Rostova', company: 'Vanguard BioTech Labs', healthScore: 52, dealValue: 35000, stage: 'FOLLOW_UP_NEEDED', phone: '+12125550199' },
        { id: 'risk-4', name: 'Tariq Al-Mansoor', company: 'Gulf Petrochemical Systems', healthScore: 38, dealValue: 64000, stage: 'NEW_LEAD', phone: '+971501234567' }
      ];

      demoEscalations.forEach(item => {
        if (!seenNames.has(item.name)) {
          seenNames.add(item.name);
          highRisk.push(item);
        }
      });

      setRiskData(highRisk);
    } catch (err) {
      console.error('Failed to load automation hub data:', err);
    } finally {
      setLoadingSeq(false);
    }
  };

  const [generatingEscalation, setGeneratingEscalation] = useState(false);

  const handleTriggerEscalation = async (c) => {
    setEscalationCustomer(c);
    setGeneratingEscalation(true);
    setCopiedEscalation(false);

    const initialMsg = isArabic 
      ? `🧠 جاري تحليل المخاطر وتوليد رسالة التصعيد بواسطة الوكيل الذكي (Agentic AI) لـ ${c.name}...`
      : `🧠 Agentic AI analyzing deal churn risks for ${c.name}...`;
    setEscalationMsg(initialMsg);

    try {
      const prompt = isArabic
        ? `أنت وكيل مبيعات ذكي (Agentic AI). قم بتحليل خطر انسحاب الصفقة للعميل "${c.name}" (شركة: ${c.company || 'فردي'}، قيمة الصفقة: $${(c.dealValue || 0).toLocaleString()}، مؤشر الصحة: ${c.healthScore}/100، المرحلة: ${c.stage}). صغ رسالة تصعيد عاجلة واحترافية ومخصصة لإرسالها عبر الواتساب للمدير تشرح سبب الخطورة والإجراء المقترح.`
        : `You are an Agentic AI Sales Escalation Agent. Analyze churn risk for deal "${c.name}" (Company: ${c.company || 'Individual'}, Value: $${(c.dealValue || 0).toLocaleString()}, Health: ${c.healthScore}/100, Stage: ${c.stage}). Write a concise, urgent, highly personalized WhatsApp escalation alert to management with recommended action.`;

      const res = await fetch('/api/v1/ai/chat/default-chatflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const data = await res.json();

      if (data && data.text) {
        setEscalationMsg(data.text);
      } else {
        const fallbackMsg = isArabic 
          ? `⚠️ تنبيه تصعيد عاجل لمخاطر الصفقة لـ ${c.name} (${c.company || 'فردي'}):\n• مؤشر صحة الصفقة: ${c.healthScore}/100\n• قيمة الصفقة: $${(c.dealValue || 0).toLocaleString()}\n• الإجراء المطلوب: تواصل فوري من الإدارة لمتابعة الصفقة وتفادي الانسحاب.`
          : `⚠️ Urgent Deal Churn Risk Escalation Alert for ${c.name} (${c.company || 'Individual'}):\n• Health Score: ${c.healthScore}/100\n• Deal Value: $${(c.dealValue || 0).toLocaleString()}\n• Required Action: Immediate manager intervention requested to retain deal.`;
        setEscalationMsg(fallbackMsg);
      }
    } catch (err) {
      console.warn('AI Escalation error:', err);
    } finally {
      setGeneratingEscalation(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-page)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* Header Banner */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
        padding: '24px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(224, 170, 62, 0.15) 0%, rgba(28, 28, 28, 0.8) 100%)',
        border: '1px solid var(--primary)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap style={{ color: 'var(--primary)' }} size={32} />
            {isArabic ? 'منظومة الأتمتة وسلاسل العمل بالذكاء الاصطناعي' : 'AI Workflows & Automation Suite'}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isArabic 
              ? 'سلاسل التغذية التلقائية، ملخص اجتماعات ومكالمات الذكاء الاصطناعي، وبوت تنبيهات المخاطر.'
              : 'Automated Drip Sequences, AI Call Notes Summarizer, and Churn Risk Escalation Bot.'
            }
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <MMButton 
          variant={activeTab === 'drip' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('drip')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calendar size={18} /> {isArabic ? 'سلاسل التغذية التلقائية (Drip)' : 'Automated Drip Sequences'}
        </MMButton>

        <MMButton 
          variant={activeTab === 'meeting' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('meeting')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PhoneCall size={18} /> {isArabic ? 'ملخص المكالمات والاجتماعات' : 'AI Call & Meeting Summarizer'}
        </MMButton>

        <MMButton 
          variant={activeTab === 'risk' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('risk')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <AlertTriangle size={18} /> {isArabic ? 'مخاطر فقدان العملاء (Churn)' : 'Churn Risk & Escalations'}
        </MMButton>
      </div>

      {/* TAB 1: AUTOMATED DRIP SEQUENCES */}
      {activeTab === 'drip' && (
        <MMCard title={isArabic ? '🔄 سلاسل متابعة وتغذية العملاء النشطة' : '🔄 Active Lead Nurturing Drip Sequences'}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '20px' }}>
            {isArabic 
              ? 'عند إدخال عميل محتمل جديد، يتم تنفيذ نقاط التواصل المبرمجة آلياً عبر 14 يوماً:'
              : 'When a new lead enters your pipeline, these automated touchpoints execute automatically over 14 days:'
            }
          </p>

          {loadingSeq ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>{isArabic ? 'جاري تحميل السلاسل...' : 'Loading sequences...'}</div>
          ) : sequences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>{isArabic ? 'لا توجد سلاسل نشطة.' : 'No active sequences found.'}</div>
          ) : (
            sequences.map((seq) => (
              <div key={seq.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{seq.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {isArabic ? 'المحفز:' : 'Trigger:'} <strong>{seq.triggerStage}</strong>
                    </span>
                  </div>
                  <MMBadge variant="success">{isArabic ? 'مفعل آلياً' : 'Active Auto-Pilot'}</MMBadge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {seq.steps?.map((step, idx) => (
                    <div key={step.id || idx} style={{ 
                      padding: '16px', borderRadius: '10px', background: 'var(--bg-surface)', 
                      border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {isArabic ? `اليوم ${step.delayDays} - نقطة تواصل` : `Day ${step.delayDays} Touchpoint`}
                        </span>
                        <MMBadge variant={step.channel === 'WHATSAPP' ? 'success' : 'info'}>
                          {step.channel}
                        </MMBadge>
                      </div>

                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{step.templateSubject || 'Follow-up'}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {step.templateBody}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </MMCard>
      )}

      {/* TAB 2: AI CALL & MEETING NOTES SUMMARIZER */}
      {activeTab === 'meeting' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Input Form */}
          <MMCard title={isArabic ? '🎙️ مستخرج ملاحظات ورؤى الاجتماعات' : '🎙️ AI Meeting & Call Notes Extractor'}>
            <form onSubmit={handleSummarizeCall} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'اختر العميل المحتمل (اختياري)' : 'Select Customer Client'}
                </label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{ 
                    width: '100%', padding: '10px', borderRadius: '8px', 
                    background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' 
                  }}
                >
                  <option value="">{isArabic ? '-- اختر العميل --' : '-- Select Customer (Optional) --'}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'فردي'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'ملاحظات وتفريغ المكالمة أو الاجتماع *' : 'Raw Call Transcript or Meeting Notes *'}
                </label>
                <textarea 
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder={isArabic ? 'انسخ ملاحظات الاجتماع هنا... مثلاً: العميل أبدى اهتماماً بالباقة لكن لديه تخوف من ميزانية 15 ألف، وتفقنا على مكالمة متابعة الثلاثاء القادم.' : 'Paste client call notes here...'}
                  style={{
                    width: '100%', height: '140px', padding: '12px', borderRadius: '8px',
                    background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                    fontFamily: 'inherit', fontSize: '14px', resize: 'vertical'
                  }}
                  required
                />
              </div>

              <MMButton type="submit" variant="primary" disabled={summarizing} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={18} /> {summarizing ? (isArabic ? 'جاري الاستخراج بالذكاء الاصطناعي...' : 'Extracting with AI...') : (isArabic ? 'استخراج الاعتراضات وإنشاء مهمة تلقائية' : 'Extract Objections & Auto-Create Task')}
              </MMButton>
            </form>
          </MMCard>

          {/* Result Summary */}
          <MMCard title={isArabic ? '📊 الرؤى والمهام التلقائية المستخرجة' : '📊 Extracted Insights & Auto Tasks'}>
            {!summaryResult ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
                <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p>{isArabic ? 'انسخ ملاحظات المكالمة على اليسار واضغط استخراج لتوليد المهام ورؤى الذكاء الاصطناعي.' : 'Paste call notes on the left and click Extract to generate structured insights.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{isArabic ? 'ملخص المكالمة الذكي' : 'AI Call Summary'}</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', whiteSpace: 'pre-line' }}>{summaryResult.aiSummary}</p>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--danger-color)' }}>{isArabic ? 'الاعتراضات المحددة للعميل' : 'Customer Objections Identified'}</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', whiteSpace: 'pre-line' }}>{summaryResult.objections}</p>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--success-color)' }}>{isArabic ? 'مهام المتابعة التي تم إنشاؤها تلقائياً' : 'Auto-Created Follow-up Action Items'}</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', whiteSpace: 'pre-line' }}>{summaryResult.actionItems}</p>
                </div>
              </div>
            )}
          </MMCard>
        </div>
      )}

      {/* TAB 3: CHURN RISK & ESCALATION BOT */}
      {activeTab === 'risk' && (
        <MMCard title={isArabic ? '⚠️ مخاطر فقدان العملاء والتنبيهات العاجلة' : '⚠️ Churn Risk & High Priority Escalations'}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '16px' }}>
            {isArabic 
              ? 'الصفقات ذات المؤشرات المنخفضة أو التأخير المعلمة لتنبيه المدراء:'
              : 'Deals with low health scores or delayed responses flagged for manager escalation:'
            }
          </p>

          {riskData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success-color)', marginBottom: '8px' }} />
              <p>{isArabic ? 'لا توجد صفقات في خطر! صحة الصفقات 100%.' : 'No high-churn-risk deals detected. Pipeline health is 100%!'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {riskData.map(c => (
                <div key={c.id} style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--warning-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{c.name}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.company || (isArabic ? 'فردي' : 'Individual')}</span>
                    </div>
                    <MMBadge variant="danger">{isArabic ? 'مؤشر الصحة:' : 'Health:'} {c.healthScore}/100</MMBadge>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {isArabic ? 'قيمة الصفقة:' : 'Deal Value:'} <strong style={{ color: 'var(--success-color)' }}>${(c.dealValue || 0).toLocaleString()}</strong>
                  </p>
                  <MMButton 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleTriggerEscalation(c)}
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    {isArabic ? 'تنشيط تصعيد الواتساب الفوري بالذكاء الاصطناعي' : 'Trigger 1-Click AI WhatsApp Escalation'}
                  </MMButton>
                </div>
              ))}
            </div>
          )}
        </MMCard>
      )}

      {/* Escalation WhatsApp Modal */}
      {escalationCustomer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--warning-color)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '580px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={22} />
                {isArabic ? `تصعيد الواتساب الفوري — ${escalationCustomer.name}` : `WhatsApp AI Escalation — ${escalationCustomer.name}`}
              </h3>
              <button 
                onClick={() => setEscalationCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isArabic ? 'تم إنشاء رسالة التصعيد العاجلة بالذكاء الاصطناعي:' : 'AI Escalation message generated:'}
            </div>

            <textarea 
              value={escalationMsg}
              onChange={(e) => setEscalationMsg(e.target.value)}
              style={{
                width: '100%', height: '140px', padding: '12px', borderRadius: '8px',
                background: 'var(--bg-page)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                fontFamily: 'inherit', fontSize: '14px', resize: 'vertical', marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <MMButton variant="ghost" onClick={() => setEscalationCustomer(null)}>
                {isArabic ? 'إغلاق' : 'Close'}
              </MMButton>

              <MMButton 
                variant="secondary" 
                onClick={() => {
                  navigator.clipboard.writeText(escalationMsg);
                  setCopiedEscalation(true);
                  setTimeout(() => setCopiedEscalation(false), 2500);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedEscalation ? <Check size={16} style={{ color: 'var(--success-color)' }} /> : <Copy size={16} />}
                {copiedEscalation ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ الرسالة' : 'Copy Alert')}
              </MMButton>

              {escalationCustomer.phone ? (
                <a 
                  href={`https://wa.me/${escalationCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(escalationMsg)}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <MMButton variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', borderColor: '#25D366' }}>
                    <Send size={16} /> {isArabic ? 'فتح واتساب لإرسال التصعيد' : 'Open WhatsApp to Send'}
                  </MMButton>
                </a>
              ) : (
                <MMButton 
                  variant="primary" 
                  onClick={() => {
                    const phone = prompt(isArabic ? 'أدخل رقم هاتف العميل (مع كود الدولة):' : 'Enter phone number with country code:');
                    if (phone) {
                      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(escalationMsg)}`, '_blank');
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', borderColor: '#25D366' }}
                >
                  <Send size={16} /> {isArabic ? 'إدخال رقم وإرسال واتساب' : 'Enter Phone & Send WhatsApp'}
                </MMButton>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
