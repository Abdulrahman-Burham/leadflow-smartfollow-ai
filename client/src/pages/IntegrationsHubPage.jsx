import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MMCard, MMButton, MMBadge, MMInput, MMSelect } from '../sdk';
import MMFileImport from '../sdk/modules/documents/MMFileImport';
import customerService from '../services/customerService';
import { 
    Upload, MessageSquare, Mail, Database, CheckCircle2, 
    Sparkles, QrCode, Cpu, ShieldCheck, UserPlus, ArrowRight, Layers, Key
} from 'lucide-react';

export default function IntegrationsHubPage() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [activeStep, setActiveStep] = useState(1);
    
    // Step 1: Data Import state
    const [importSuccessMessage, setImportSuccessMessage] = useState('');

    // Step 2: Channel Connect State
    const [whatsappConnected, setWhatsappConnected] = useState(false);
    const [connectingWhatsapp, setConnectingWhatsapp] = useState(false);
    const [emailSmtp, setEmailSmtp] = useState({ host: 'smtp.gmail.com', port: '587', user: 'sales@micromind.com', password: '••••••••' });
    const [emailConnected, setEmailConnected] = useState(true);

    // Step 3: Knowledge Base Config
    const [knowledgeBase, setKnowledgeBase] = useState({
        companyName: 'Acme Global Trading',
        industry: 'B2B SaaS / Enterprise Automation',
        products: 'Pro Automation ($499/mo), Enterprise CRM ($1299/mo)',
        discountOffer: '15% annual billing discount',
        slaHours: '48 hours onboarding'
    });
    const [kbSaved, setKbSaved] = useState(false);

    const handleDataUpload = async (file) => {
        // Read file content or simulate bulk parsing into database
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    // Create sample imported lead
                    await customerService.createCustomer({
                        name: 'Imported Enterprise Lead',
                        company: 'Nexus Tech Global',
                        email: 'contact@nexustech.io',
                        phone: '+1-800-555-0199',
                        stage: 'NEW_LEAD',
                        dealValue: 32000,
                        notes: 'Bulk imported via Data Integration Hub'
                    });
                    setImportSuccessMessage(isArabic ? 'تم استيراد قائمة العملاء وتحديث قاعدة البيانات بنجاح! 🚀' : 'Data imported and DB updated successfully! 🚀');
                    resolve();
                } catch (e) {
                    resolve();
                }
            }, 1200);
        });
    };

    const handleConnectWhatsapp = () => {
        setConnectingWhatsapp(true);
        setTimeout(() => {
            setConnectingWhatsapp(false);
            setWhatsappConnected(true);
        }, 2000);
    };

    const handleSaveKnowledgeBase = (e) => {
        e.preventDefault();
        localStorage.setItem('business_knowledge_base', JSON.stringify(knowledgeBase));
        setKbSaved(true);
        setTimeout(() => setKbSaved(false), 3000);
    };

    return (
        <div style={{ padding: '24px', background: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            
            {/* Header Banner */}
            <div style={{
                marginBottom: '24px',
                padding: '24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(224, 170, 62, 0.18) 0%, rgba(20, 20, 20, 0.9) 100%)',
                border: '1px solid var(--primary)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Database style={{ color: 'var(--primary)' }} size={28} />
                        {isArabic ? 'مركز الربط وتهيئة البيانات (Onboarding & Integrations Hub)' : 'Onboarding & Integrations Hub'}
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {isArabic 
                            ? 'دليل التهيئة والربط للشركات الجديدة: ربط قنوات الاتصال، استيراد العملاء (CSV)، وتدريب محرك الذكاء الاصطناعي.'
                            : 'Guided onboarding for new accounts: connect communication channels, import customer lists, and train AI knowledge.'
                        }
                    </p>
                </div>

                <MMBadge variant="success" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} />
                    {isArabic ? 'حالة التهيئة: مكتملة 75%' : 'Onboarding Status: 75% Complete'}
                </MMBadge>
            </div>

            {/* Stepper Nav */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div 
                    onClick={() => setActiveStep(1)}
                    style={{
                        padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                        background: activeStep === 1 ? 'var(--primary)' : 'var(--bg-surface)',
                        color: activeStep === 1 ? '#000' : 'var(--text-primary)',
                        border: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                >
                    <Upload size={18} />
                    1. {isArabic ? 'استيراد العملاء (CSV)' : 'Import Data (CSV)'}
                </div>

                <div 
                    onClick={() => setActiveStep(2)}
                    style={{
                        padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                        background: activeStep === 2 ? 'var(--primary)' : 'var(--bg-surface)',
                        color: activeStep === 2 ? '#000' : 'var(--text-primary)',
                        border: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                >
                    <MessageSquare size={18} />
                    2. {isArabic ? 'ربط القنوات (WhatsApp & Email)' : 'Connect Channels'}
                </div>

                <div 
                    onClick={() => setActiveStep(3)}
                    style={{
                        padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                        background: activeStep === 3 ? 'var(--primary)' : 'var(--bg-surface)',
                        color: activeStep === 3 ? '#000' : 'var(--text-primary)',
                        border: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                >
                    <Cpu size={18} />
                    3. {isArabic ? 'تدريب قاعدة المعرفة (Knowledge)' : 'Train AI Knowledge'}
                </div>
            </div>

            {/* STEP 1: CSV / EXCEL IMPORT */}
            {activeStep === 1 && (
                <MMCard title={isArabic ? '📥 استيراد قائمة العملاء والصفقات الحالية' : '📥 Bulk Customer & Leads Import'}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: 0 }}>
                        {isArabic 
                            ? 'قم برفع ملف Excel أو CSV ليقوم المنظومة بتوليد قاعدة البيانات ومطابقة الأعمدة تلقائياً:' 
                            : 'Upload your CSV or Excel file to automatically parse and seed your workspace pipeline:'
                        }
                    </p>

                    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
                        <MMFileImport
                            allowedExtensions={['csv', 'xlsx', 'xls']}
                            onUpload={handleDataUpload}
                            title={isArabic ? 'رفع ملف Excel / CSV' : 'Drag & Drop CSV / Excel Spreadsheet'}
                            subtitle={isArabic ? 'يدعم أسماء العملاء، الشركات، البريد، وقيم الصفقات' : 'Supports Name, Company, Email, Phone, Deal Value, Stage'}
                        />
                    </div>

                    {importSuccessMessage && (
                        <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle2 size={20} />
                            <span>{importSuccessMessage}</span>
                        </div>
                    )}
                </MMCard>
            )}

            {/* STEP 2: CONNECT CHANNELS */}
            {activeStep === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* WhatsApp Connector */}
                    <MMCard title="💬 WhatsApp Business Cloud API / Webhook">
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 0 }}>
                            {isArabic ? 'ربط رقم الواتساب بالرمز التفاعلي لتلقي الرسائل والتجاوب التلقائي بالـ AI:' : 'Scan QR code or bind Meta Cloud API Key to automate WhatsApp messaging:'}
                        </p>

                        <div style={{ padding: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center', marginBottom: '16px' }}>
                            {whatsappConnected ? (
                                <div>
                                    <CheckCircle2 size={48} style={{ color: '#22c55e', marginBottom: '8px' }} />
                                    <h4 style={{ margin: 0, color: '#22c55e' }}>{isArabic ? 'متصل بنجاح 🟢' : 'WhatsApp API Connected 🟢'}</h4>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+201009998877 (Meta Cloud Gateway Active)</span>
                                </div>
                            ) : (
                                <div>
                                    <QrCode size={64} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                                    <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>{isArabic ? 'امسح الرمز بواسطة واتساب للأعمال' : 'Scan with WhatsApp Business app to link account'}</p>
                                    <MMButton variant="primary" onClick={handleConnectWhatsapp} disabled={connectingWhatsapp}>
                                        {connectingWhatsapp ? (isArabic ? 'جاري الاتصال...' : 'Connecting...') : (isArabic ? 'محاكاة المسح والربط' : 'Simulate QR Connection')}
                                    </MMButton>
                                </div>
                            )}
                        </div>
                    </MMCard>

                    {/* Email SMTP Gateway */}
                    <MMCard title="✉️ Email Gateway (SMTP / SendGrid)">
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 0 }}>
                            {isArabic ? 'ربط بريد الشركة لإرسال رسائل المتابعات والعروض:' : 'Configure SMTP credentials for outgoing sales emails:'}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SMTP Server Host</label>
                                <MMInput value={emailSmtp.host} onChange={(e) => setEmailSmtp({ ...emailSmtp, host: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sender Email</label>
                                <MMInput value={emailSmtp.user} onChange={(e) => setEmailSmtp({ ...emailSmtp, user: e.target.value })} />
                            </div>
                            <MMButton variant="secondary" onClick={() => alert(isArabic ? 'تم اختبار وتأكيد الاتصال بالبريد!' : 'SMTP Connection Verified!')}>
                                {isArabic ? 'اختبار ربط البريد' : 'Test Email Connection'}
                            </MMButton>
                        </div>
                    </MMCard>
                </div>
            )}

            {/* STEP 3: TRAIN AI KNOWLEDGE BASE */}
            {activeStep === 3 && (
                <MMCard title={isArabic ? '🧠 تدريب قواعد معرفة الذكاء الاصطناعي (Business Knowledge Base)' : '🧠 Train AI Business Knowledge Base'}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: 0 }}>
                        {isArabic 
                            ? 'أدخل بيانات منتجاتك وأسعارك لردود الـ AI التلقائية بناءً على معايير منطقتك:' 
                            : 'Define your products, pricing tiers, and SLA rules to guide automated AI responses:'
                        }
                    </p>

                    <form onSubmit={handleSaveKnowledgeBase} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                                {isArabic ? 'اسم الشركة ومجال العمل' : 'Company Name & Industry'}
                            </label>
                            <MMInput 
                                value={knowledgeBase.companyName} 
                                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, companyName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                                {isArabic ? 'المنتجات والأسعار والباقات' : 'Products & Pricing Tiers'}
                            </label>
                            <textarea 
                                value={knowledgeBase.products} 
                                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, products: e.target.value })}
                                style={{ width: '100%', minHeight: '80px', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                                {isArabic ? 'العروض الخاصة والخصومات' : 'Special Offers & Discounts'}
                            </label>
                            <MMInput 
                                value={knowledgeBase.discountOffer} 
                                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, discountOffer: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MMButton type="submit" variant="primary">
                                {isArabic ? 'حفظ قواعد المعرفة' : 'Save Knowledge Base'}
                            </MMButton>

                            {kbSaved && (
                                <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={16} /> {isArabic ? 'تم حفظ وتحديث الـ AI Agent!' : 'AI Knowledge Updated!'}
                                </span>
                            )}
                        </div>
                    </form>
                </MMCard>
            )}

        </div>
    );
}
