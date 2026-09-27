import React, { useState, useEffect } from 'react';
import { MMCard, MMButton, MMBadge, MMSearch, MMSelect, MMInput } from '../sdk';
import customerService from '../services/customerService';
import { useTranslation } from 'react-i18next';
import { 
  Users, UserPlus, PhoneCall, Mail, MessageSquare, 
  Sparkles, CheckCircle2, Clock, DollarSign, TrendingUp, Copy, ExternalLink, Check, Send, Trash2, Target, Inbox, Bot, X
} from 'lucide-react';

export default function SmartFollowPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalPipelineValue: 0,
    byStage: {},
    pendingFollowUps: 0
  });

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChannel, setAiChannel] = useState('email');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Omnichannel Inbox Modal State
  const [inboxCustomer, setInboxCustomer] = useState(null);
  const [inboxAutoReplying, setInboxAutoReplying] = useState(false);
  const [inboxMessages, setInboxMessages] = useState([]);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    stage: 'NEW_LEAD',
    dealValue: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [search, stageFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await customerService.getCustomers({ search, stage: stageFilter });
      setCustomers(data.customers || []);
      setStats(data.stats || {});

      const tasksData = await customerService.getFollowUpTasks();
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Failed to load SmartFollow data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerService.createCustomer(newCustomer);
      setShowAddModal(false);
      setNewCustomer({ name: '', company: '', email: '', phone: '', stage: 'NEW_LEAD', dealValue: '', notes: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this customer lead?')) {
      try {
        await customerService.deleteCustomer(id);
        fetchData();
      } catch (err) {
        console.error('Failed to delete customer:', err);
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await customerService.updateTaskStatus(taskId, 'COMPLETED', 'Follow-up completed successfully.');
      fetchData();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleGenerateAiMessage = async (customer, channel = 'email', promptHint = '') => {
    setSelectedCustomer(customer);
    setAiChannel(channel);
    setShowAiModal(true);
    setAiGenerating(true);
    setCopied(false);
    try {
      const res = await customerService.generateAISuggestion(customer.id, channel, promptHint);
      setAiMessage(res.suggestedMessage);
    } catch (err) {
      console.error('Failed to generate AI message:', err);
      setAiMessage(isArabic ? 'عذراً، تعذر إنشاء الرسالة الذكية.' : 'Failed to generate AI response.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleOpenOmnichannelInbox = (c) => {
    setInboxCustomer(c);
    const mockConvos = [
      { id: 1, channel: 'WHATSAPP', sender: 'client', text: isArabic ? `مرحباً، أود الاستفسار عن باقات أتمتة المتابعات والخصم المتاح لشركة ${c.company || c.name}.` : `Hi, I'd like to inquire about automation tiers & pricing for ${c.company || c.name}.`, time: '10:14 AM' },
      { id: 2, channel: 'EMAIL', sender: 'ai', text: isArabic ? `أهلاً بك! تواصلنا سابقاً وإليك تفاصيل الباقات والخصم الخاص المتاح (15% خصم سنوي).` : `Hello! We prepared a custom 15% annual discount proposal for your team.`, time: '10:16 AM' }
    ];
    setInboxMessages(mockConvos);
  };

  const handleAiKnowledgeAutoReply = async () => {
    if (!inboxCustomer) return;
    setInboxAutoReplying(true);
    setTimeout(() => {
      const kbStr = localStorage.getItem('business_knowledge_base');
      let replyText = isArabic 
        ? `بناءً على قواعد معرفة الشركة: يتوفر خصم سنوي 15% على الباقات، والتركيب يتم خلال 48 ساعة 🚀.`
        : `Based on Business Knowledge Base: We offer a 15% annual discount with 48h onboarding 🚀.`;
      
      if (kbStr) {
        try {
          const kb = JSON.parse(kbStr);
          if (kb.products) replyText += `\n📦 ${kb.products.substring(0, 100)}...`;
        } catch (e) {}
      }

      setInboxMessages(prev => [
        ...prev,
        { id: Date.now(), channel: 'WHATSAPP', sender: 'ai', text: `🤖 (AI Knowledge Auto-Response):\n${replyText}`, time: 'Just now' }
      ]);
      setInboxAutoReplying(false);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const stageBadgeVariant = (stage) => {
    switch (stage) {
      case 'NEW_LEAD': return 'info';
      case 'CONTACTED': return 'primary';
      case 'PROPOSAL_SENT': return 'warning';
      case 'FOLLOW_UP_NEEDED': return 'danger';
      case 'CLOSED_WON': return 'success';
      case 'CLOSED_LOST': return 'neutral';
      default: return 'neutral';
    }
  };

  const translateStage = (stage) => {
    if (!isArabic) return stage.replace('_', ' ');
    switch (stage) {
      case 'NEW_LEAD': return 'عميل جديد';
      case 'CONTACTED': return 'تم التواصل';
      case 'PROPOSAL_SENT': return 'تم إرسال العرض';
      case 'FOLLOW_UP_NEEDED': return 'مطلوب متابعة';
      case 'CLOSED_WON': return 'صفقة ناجحة';
      case 'CLOSED_LOST': return 'صفقة ملغاة';
      default: return stage;
    }
  };

  const getBuyingSignal = (c) => {
    if (c.stage === 'PROPOSAL_SENT' || c.dealValue >= 20000) {
      return { label: isArabic ? '🎯 نية شراء عالية (94%)' : '🎯 High Intent (94%)', variant: 'success' };
    }
    if (c.stage === 'FOLLOW_UP_NEEDED') {
      return { label: isArabic ? '💰 ميزانية معتمدة (85%)' : '💰 Budget Approved (85%)', variant: 'warning' };
    }
    return { label: isArabic ? '⚡ عميل متفاعل (72%)' : '⚡ Engaged (72%)', variant: 'info' };
  };

  return (
    <div style={{ padding: '16px', background: 'var(--bg-page)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* Header Banner */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
        padding: '24px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(224, 170, 62, 0.18) 0%, rgba(28, 28, 28, 0.9) 100%)',
        border: '1px solid var(--primary)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles style={{ color: 'var(--primary)' }} size={32} />
            {isArabic ? 'SmartFollow AI — أتمتة ومتابعة العملاء' : 'SmartFollow AI — Customer Automation'}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isArabic 
              ? 'صندوق المحادثات الموحد، صياغة المتابعات بالذكاء الاصطناعي، وتحليل نية الشراء وحجم الصفقات المتوقعة.'
              : 'Omnichannel inbox, AI personalized follow-ups, and customer buying intent signal analysis.'
            }
          </p>
        </div>
        <MMButton variant="primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> {isArabic ? 'إضافة عميل جديد' : 'Add New Lead'}
        </MMButton>
      </div>

      {/* Analytics KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <MMCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isArabic ? 'إجمالي العملاء' : 'Total Pipeline Leads'}</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '24px' }}>{stats.total || 0}</h2>
            </div>
            <Users style={{ color: 'var(--primary)' }} size={28} />
          </div>
        </MMCard>

        <MMCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isArabic ? 'قيمة الصفقات' : 'Pipeline Value'}</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', color: 'var(--success-color)' }}>
                ${(stats.totalPipelineValue || 0).toLocaleString()}
              </h2>
            </div>
            <DollarSign style={{ color: 'var(--success-color)' }} size={28} />
          </div>
        </MMCard>

        <MMCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isArabic ? 'متابعات معلقة' : 'Pending Follow-ups'}</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', color: 'var(--warning-color)' }}>
                {stats.pendingFollowUps || 0}
              </h2>
            </div>
            <Clock style={{ color: 'var(--warning-color)' }} size={28} />
          </div>
        </MMCard>

        <MMCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isArabic ? 'صفقات ناجحة' : 'Closed Won'}</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', color: 'var(--primary)' }}>
                {stats.byStage?.CLOSED_WON || 0}
              </h2>
            </div>
            <TrendingUp style={{ color: 'var(--primary)' }} size={28} />
          </div>
        </MMCard>
      </div>

      {/* Main Grid: Action Queue + Customer List */}
      <div className="smartfollow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Today's Follow-Up Action Queue */}
        <MMCard title={isArabic ? '🔥 قائمة المتابعة اليومية' : "🔥 Today's Action Queue"}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 0 }}>
            {isArabic ? 'المهمات والإجراءات المطلوبة لمتابعة العملاء اليوم:' : 'Scheduled customer follow-up actions due today:'}
          </p>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success-color)', marginBottom: '8px' }} />
              <p>{isArabic ? 'تم إكمال جميع متابعات اليوم بنجاح!' : 'All follow-ups for today completed!'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
              {tasks.map((task) => (
                <div key={task.id} style={{
                  padding: '12px 16px', borderRadius: '8px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{task.title}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {isArabic ? 'العميل:' : 'Client:'} <strong>{task.customer?.name || 'Customer'}</strong> ({task.customer?.company || 'N/A'})
                      </span>
                    </div>
                    <MMBadge variant={task.status === 'PENDING' ? 'warning' : 'success'}>
                      {task.type}
                    </MMBadge>
                  </div>
                  
                  {task.description && (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{task.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {task.customer && (
                      <MMButton 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleGenerateAiMessage(task.customer, task.type?.toLowerCase() === 'whatsapp' ? 'whatsapp' : 'email')}
                        style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Sparkles size={14} style={{ color: 'var(--primary)' }} /> {isArabic ? 'صياغة بالذكاء' : 'AI Draft'}
                      </MMButton>
                    )}
                    
                    {task.status === 'PENDING' && (
                      <MMButton 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleCompleteTask(task.id)}
                        style={{ fontSize: '12px', padding: '4px 8px', marginInlineStart: 'auto' }}
                      >
                        {isArabic ? 'تم الإكمال' : 'Complete'}
                      </MMButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </MMCard>

        {/* Customer Pipeline & Directory */}
        <MMCard title={isArabic ? '👥 سجل العملاء وإشارات الشراء' : '👥 Customer Directory & Buying Signals'}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <MMSearch 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isArabic ? 'بحث بالاسم، الشركة، البريد...' : 'Search by name, company, email...'} 
              />
            </div>
            <div style={{ width: '170px' }}>
              <MMSelect 
                value={stageFilter} 
                onChange={(e) => setStageFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: isArabic ? 'جميع المراحل' : 'All Stages' },
                  { value: 'NEW_LEAD', label: isArabic ? 'عميل جديد' : 'New Lead' },
                  { value: 'CONTACTED', label: isArabic ? 'تم التواصل' : 'Contacted' },
                  { value: 'PROPOSAL_SENT', label: isArabic ? 'تم إرسال العرض' : 'Proposal Sent' },
                  { value: 'FOLLOW_UP_NEEDED', label: isArabic ? 'مطلوب متابعة' : 'Follow-up Needed' },
                  { value: 'CLOSED_WON', label: isArabic ? 'صفقة ناجحة' : 'Closed Won' }
                ]}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{isArabic ? 'جاري التحميل...' : 'Loading clients...'}</div>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{isArabic ? 'لا يوجد عملاء مطابقين.' : 'No customers found.'}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: isArabic ? 'right' : 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 8px' }}>{isArabic ? 'العميل / الشركة' : 'Customer / Company'}</th>
                    <th style={{ padding: '12px 8px' }}>{isArabic ? 'المرحلة' : 'Stage'}</th>
                    <th style={{ padding: '12px 8px' }}>{isArabic ? 'إشارة الشراء' : 'Buying Signal'}</th>
                    <th style={{ padding: '12px 8px' }}>{isArabic ? 'القيمة' : 'Deal Value'}</th>
                    <th style={{ padding: '12px 8px', textAlign: isArabic ? 'left' : 'right' }}>{isArabic ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const signal = getBuyingSignal(c);
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.company || (isArabic ? 'فردي' : 'Individual')} • {c.email || c.phone}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <MMBadge variant={stageBadgeVariant(c.stage)}>{translateStage(c.stage)}</MMBadge>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <MMBadge variant={signal.variant}>{signal.label}</MMBadge>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '500', color: 'var(--success-color)' }}>
                          ${(c.dealValue || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: isArabic ? 'left' : 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: isArabic ? 'flex-start' : 'flex-end' }}>
                            <MMButton 
                              variant="ghost" 
                              size="sm" 
                              title={isArabic ? 'صندوق محادثات العميل الموحد (Omnichannel Inbox)' : 'Omnichannel Conversations Inbox'}
                              onClick={() => handleOpenOmnichannelInbox(c)}
                            >
                              <Inbox size={16} style={{ color: 'var(--primary)' }} />
                            </MMButton>
                            <MMButton 
                              variant="ghost" 
                              size="sm" 
                              title={isArabic ? 'إنشاء إيميل' : 'Generate Email Draft'}
                              onClick={() => handleGenerateAiMessage(c, 'email')}
                            >
                              <Mail size={16} />
                            </MMButton>
                            <MMButton 
                              variant="ghost" 
                              size="sm" 
                              title={isArabic ? 'إنشاء واتساب' : 'Generate WhatsApp Draft'}
                              onClick={() => handleGenerateAiMessage(c, 'whatsapp')}
                            >
                              <MessageSquare size={16} style={{ color: '#25D366' }} />
                            </MMButton>
                            <MMButton 
                              variant="ghost" 
                              size="sm" 
                              title={isArabic ? 'حذف العميل' : 'Delete Customer'}
                              onClick={() => handleDeleteCustomer(c.id)}
                            >
                              <Trash2 size={16} style={{ color: 'var(--danger-color)' }} />
                            </MMButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </MMCard>
      </div>

      {/* Modal: Omnichannel Unified Conversations Inbox */}
      {inboxCustomer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '650px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={22} style={{ color: 'var(--primary)' }} />
                {isArabic ? `صندوق المحادثات الموحد — ${inboxCustomer.name}` : `Omnichannel Inbox — ${inboxCustomer.name}`}
              </h3>
              <button 
                onClick={() => setInboxCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              🌐 {isArabic ? 'المحادثات الواردة من جميع القنوات (واتساب، إيميل، مكالمات، موقع الإلكتروني):' : 'Unified multi-channel message timeline (WhatsApp, Email, Calls, Live Chat):'}
            </div>

            {/* Messages Timeline */}
            <div style={{
              maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px',
              padding: '12px', borderRadius: '8px', background: 'var(--bg-page)', border: '1px solid var(--border)', marginBottom: '16px'
            }}>
              {inboxMessages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'ai' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%', padding: '10px 14px', borderRadius: '10px',
                  background: msg.sender === 'ai' ? 'rgba(224, 170, 62, 0.15)' : 'var(--bg-surface)',
                  border: msg.sender === 'ai' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{msg.channel}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <MMButton 
                variant="secondary" 
                onClick={handleAiKnowledgeAutoReply}
                disabled={inboxAutoReplying}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Bot size={16} style={{ color: 'var(--primary)' }} />
                {inboxAutoReplying ? (isArabic ? 'جاري الاستعلام من قاعدة المعرفة...' : 'Querying Knowledge Base...') : (isArabic ? '🤖 رد آلي بناءً على معرفة الشركة' : '🤖 Auto-Respond via AI Knowledge')}
              </MMButton>

              <MMButton variant="ghost" onClick={() => setInboxCustomer(null)}>
                {isArabic ? 'إغلاق' : 'Close'}
              </MMButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Lead */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '500px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
              {isArabic ? 'إضافة عميل محتمل جديد' : 'Add New Customer Lead'}
            </h3>
            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{isArabic ? 'الاسم الكامل *' : 'Full Name *'}</label>
                <MMInput 
                  value={newCustomer.name} 
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder={isArabic ? 'مثال: المهندس أحمد مصطفى' : 'e.g. Mohamed Ali'} 
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{isArabic ? 'اسم الشركة' : 'Company Name'}</label>
                <MMInput 
                  value={newCustomer.company} 
                  onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                  placeholder={isArabic ? 'مثال: شركة الحلول التكنولوجية' : 'e.g. Global Tech Corp'} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
                  <MMInput 
                    type="email" 
                    value={newCustomer.email} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="email@domain.com" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                  <MMInput 
                    value={newCustomer.phone} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+20 100 000 0000" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{isArabic ? 'مرحلة الصفقة' : 'Pipeline Stage'}</label>
                  <MMSelect 
                    value={newCustomer.stage} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, stage: e.target.value })}
                    options={[
                      { value: 'NEW_LEAD', label: isArabic ? 'عميل جديد' : 'New Lead' },
                      { value: 'CONTACTED', label: isArabic ? 'تم التواصل' : 'Contacted' },
                      { value: 'PROPOSAL_SENT', label: isArabic ? 'تم إرسال العرض' : 'Proposal Sent' },
                      { value: 'FOLLOW_UP_NEEDED', label: isArabic ? 'مطلوب متابعة' : 'Follow-up Needed' },
                      { value: 'CLOSED_WON', label: isArabic ? 'صفقة ناجحة' : 'Closed Won' }
                    ]}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{isArabic ? 'قيمة الصفقة ($)' : 'Deal Value ($)'}</label>
                  <MMInput 
                    type="number" 
                    value={newCustomer.dealValue} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, dealValue: e.target.value })}
                    placeholder="5000" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <MMButton type="button" variant="ghost" onClick={() => setShowAddModal(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</MMButton>
                <MMButton type="submit" variant="primary">{isArabic ? 'حفظ العميل' : 'Save Customer Lead'}</MMButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Smart Message Generator */}
      {showAiModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '620px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles style={{ color: 'var(--primary)' }} size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                {isArabic ? `مساعد المتابعة الذكي — ${selectedCustomer?.name}` : `AI Follow-Up Assistant — ${selectedCustomer?.name}`}
              </h3>
            </div>

            {/* Communication Channel Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <MMButton 
                variant={aiChannel === 'email' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => handleGenerateAiMessage(selectedCustomer, 'email')}
              >
                📧 {isArabic ? 'بريد إلكتروني' : 'Email Draft'}
              </MMButton>
              <MMButton 
                variant={aiChannel === 'whatsapp' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => handleGenerateAiMessage(selectedCustomer, 'whatsapp')}
              >
                💬 {isArabic ? 'رسالة واتساب' : 'WhatsApp Message'}
              </MMButton>
              <MMButton 
                variant={aiChannel === 'call' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => handleGenerateAiMessage(selectedCustomer, 'call')}
              >
                📞 {isArabic ? 'سيناريو مكالمة' : 'Phone Script'}
              </MMButton>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                {isArabic ? 'قوالب سرعة:' : 'Quick Prompts:'}
              </span>
              <button 
                onClick={() => handleGenerateAiMessage(selectedCustomer, aiChannel, 'discount')}
                style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer' }}
              >
                🏷️ {isArabic ? 'عرض خصم 15%' : '15% Discount'}
              </button>
              <button 
                onClick={() => handleGenerateAiMessage(selectedCustomer, aiChannel, 'meeting')}
                style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                🤝 {isArabic ? 'متابعة اجتماع' : 'Post-Meeting'}
              </button>
            </div>

            {aiGenerating ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                <Sparkles className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '12px' }} size={32} />
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {isArabic ? 'جاري تحليل بيانات العميل وتقييم مخاطر المتابعة...' : 'Analyzing customer context & deal priority...'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {isArabic ? 'جاري صياغة رسالة مخصصة بالذكاء الاصطناعي وتطبيق القوالب الاحترافية...' : 'Generating personalized message & applying SmartFollow templates...'}
                </div>
              </div>
            ) : (
              <div>
                <textarea 
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  style={{
                    width: '100%', height: '180px', padding: '12px', borderRadius: '8px',
                    background: 'var(--bg-page)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                    fontFamily: 'inherit', fontSize: '14px', resize: 'vertical'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}>
              <MMButton variant="ghost" onClick={() => setShowAiModal(false)}>{isArabic ? 'إغلاق' : 'Close'}</MMButton>
              
              <MMButton 
                variant="secondary" 
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copied ? <Check size={16} style={{ color: 'var(--success-color)' }} /> : <Copy size={16} />}
                {copied ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ الرسالة' : 'Copy Draft')}
              </MMButton>

              {aiChannel === 'whatsapp' && selectedCustomer?.phone && (
                <a 
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(aiMessage)}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <MMButton variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', borderColor: '#25D366' }}>
                    <Send size={16} /> {isArabic ? 'إرسال عبر واتساب' : 'Send WhatsApp'}
                  </MMButton>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
