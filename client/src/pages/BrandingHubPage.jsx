import React, { useState, useEffect } from 'react';
import { MMCard, MMButton, MMInput } from '../sdk';
import automationService from '../services/automationService';
import { useTranslation } from 'react-i18next';
import { Palette, Building, Image, CheckCircle, Sparkles, RefreshCw, Eye, BookOpen, DollarSign, ShieldCheck } from 'lucide-react';

export default function BrandingHubPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState({
    name: '',
    portalTitle: 'MicroMind Business Suite',
    brandColor: '#E0AA3E',
    logo: ''
  });
  const [saved, setSaved] = useState(false);

  // Business Knowledge Base State
  const [knowledgeBase, setKnowledgeBase] = useState({
    products: 'Enterprise AI Suite ($15,000/yr), Pro Automation Tier ($5,000/yr), Starter CRM ($1,200/yr)',
    pricingPolicy: '15% Annual Billing Discount. 30-day money-back guarantee. Enterprise custom integrations available.',
    faqs: 'Q: Do you integrate with WhatsApp? A: Yes, 1-click WhatsApp web & API integration included.\nQ: What is the implementation time? A: Live in 48 hours.'
  });
  const [kbSaved, setKbSaved] = useState(false);

  useEffect(() => {
    fetchBranding();
    const savedKb = localStorage.getItem('business_knowledge_base');
    if (savedKb) {
      try {
        setKnowledgeBase(JSON.parse(savedKb));
      } catch (e) {}
    }
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const data = await automationService.getBranding();
      setBranding(data);
    } catch (err) {
      console.error('Failed to load branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    try {
      await automationService.updateBranding(branding);
      document.documentElement.style.setProperty('--primary', branding.brandColor);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save branding:', err);
    }
  };

  const handleSaveKnowledgeBase = (e) => {
    e.preventDefault();
    localStorage.setItem('business_knowledge_base', JSON.stringify(knowledgeBase));
    setKbSaved(true);
    setTimeout(() => setKbSaved(false), 3000);
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
            <Palette style={{ color: 'var(--primary)' }} size={32} />
            {isArabic ? 'مركز الهوية وقاعدة معرفة الشركة (White-Label & AI Knowledge Base)' : 'White-Label & AI Business Knowledge Hub'}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isArabic 
              ? 'تخصيص الهوية البصرية، وقواعد المعرفة والأسعار التي يعتمد عليها الذكاء الاصطناعي في الرد الآلي.'
              : 'Customize corporate branding, portal titles, and business knowledge base rules for AI auto-response.'
            }
          </p>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: 'var(--success-color)', fontWeight: 'bold' }}>
            <CheckCircle size={18} /> {isArabic ? 'تم حفظ وتطبيق الهوية!' : 'Branding Saved & Applied!'}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Branding Form */}
        <MMCard title={isArabic ? '🎨 تخصيص الهوية وثيم النظام' : '🎨 Customize Branding & Reseller Theme'}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>{isArabic ? 'جاري تحميل إعدادات الهوية...' : 'Loading branding config...'}</div>
          ) : (
            <form onSubmit={handleSaveBranding} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {isArabic ? 'اسم الشركة / المؤسسة *' : 'Organization / Client Business Name *'}
                </label>
                <MMInput 
                  value={branding.name} 
                  onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                  placeholder={isArabic ? 'مثال: شركة الحلول المتقدمة' : 'e.g. Acme Enterprise Solutions'} 
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {isArabic ? 'عنوان البوابة والنظام (Portal Title)' : 'White-Label SaaS Portal Title'}
                </label>
                <MMInput 
                  value={branding.portalTitle} 
                  onChange={(e) => setBranding({ ...branding, portalTitle: e.target.value })}
                  placeholder={isArabic ? 'مثال: منصة إدارة العملاء الذكية' : 'e.g. Acme AI Workflows'} 
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {isArabic ? 'اللون الرئيسي للهوية (Accent Color)' : 'Brand Primary Accent Color (CSS Theme Color)'}
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={branding.brandColor || '#E0AA3E'} 
                    onChange={(e) => setBranding({ ...branding, brandColor: e.target.value })}
                    style={{ width: '50px', height: '42px', padding: '2px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
                  />
                  <MMInput 
                    value={branding.brandColor || '#E0AA3E'} 
                    onChange={(e) => setBranding({ ...branding, brandColor: e.target.value })}
                    placeholder="#E0AA3E" 
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {isArabic ? 'رابط شعار الشركة (Logo Image URL)' : 'Company Logo Image URL'}
                </label>
                <MMInput 
                  value={branding.logo} 
                  onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                  placeholder="/assets/logo.png" 
                />
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <MMButton type="submit" variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={18} /> {isArabic ? 'حفظ وتطبيق الهوية البصرية' : 'Apply & Save White-Label Theme'}
                </MMButton>
              </div>
            </form>
          )}
        </MMCard>

        {/* Business Knowledge Base & Auto-Response Rules */}
        <MMCard title={isArabic ? '🤖 قاعدة معرفة الشركة وسياسات الأسعار للذكاء الاصطناعي' : '🤖 Business Knowledge Base & AI Auto-Response Rules'}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '16px' }}>
            {isArabic 
              ? 'يستخدم الذكاء الاصطناعي هذه البيانات والأسعار والسياسات للرد التلقائي وإجابة استفسارات العملاء بدقة:'
              : 'AI agents use these products, prices, and knowledge rules to automatically respond to client inquiries:'
            }
          </p>
          <form onSubmit={handleSaveKnowledgeBase} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                📦 {isArabic ? 'المنتجات والخدمات والأسعار' : 'Products, Services & Pricing Structure'}
              </label>
              <textarea 
                value={knowledgeBase.products} 
                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, products: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                  fontFamily: 'inherit', fontSize: '13px', resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                💳 {isArabic ? 'سياسات العروض والخصومات' : 'Pricing Discounts & Billing Policies'}
              </label>
              <textarea 
                value={knowledgeBase.pricingPolicy} 
                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, pricingPolicy: e.target.value })}
                rows={2}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                  fontFamily: 'inherit', fontSize: '13px', resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ❓ {isArabic ? 'الأسئلة الشائعة والإجابات النموذجية (FAQs)' : 'Frequently Asked Questions & Standard Answers'}
              </label>
              <textarea 
                value={knowledgeBase.faqs} 
                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, faqs: e.target.value })}
                rows={4}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)',
                  fontFamily: 'inherit', fontSize: '13px', resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
              {kbSaved ? (
                <span style={{ fontSize: '13px', color: 'var(--success-color)', fontWeight: 'bold' }}>
                  ✓ {isArabic ? 'تم حفظ قاعدة المعرفة!' : 'Knowledge Base Saved!'}
                </span>
              ) : <span />}
              <MMButton type="submit" variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} /> {isArabic ? 'حفظ قاعدة معرفة الشركة' : 'Save Business Knowledge Base'}
              </MMButton>
            </div>
          </form>
        </MMCard>

      </div>

    </div>
  );
}
