/**
 * AI Automations, Drip Sequences & Call Summarizer Routes
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Auth Middleware
const authCheck = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8');
        
        let orgId = decoded.organizationId;
        if (!orgId) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId || decoded.id },
                include: { memberships: true }
            });
            if (user && user.memberships.length > 0) {
                orgId = user.memberships[0].organizationId;
            }
        }
        
        req.user = { ...decoded, organizationId: orgId };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

router.use(authCheck);

/**
 * GET /api/automations/sequences
 * List all automated drip sequences
 */
router.get('/sequences', async (req, res) => {
    try {
        const orgId = req.user.organizationId;
        let sequences = await prisma.automationSequence.findMany({
            where: orgId ? { organizationId: orgId } : {},
            include: { steps: { orderBy: { delayDays: 'asc' } } }
        });

        // Seed default 4-step sequence if none exist
        if (sequences.length === 0 && orgId) {
            const newSeq = await prisma.automationSequence.create({
                data: {
                    organizationId: orgId,
                    name: 'Automated 14-Day Lead Nurturing Drip',
                    triggerStage: 'NEW_LEAD',
                    active: true,
                    steps: {
                        create: [
                            {
                                delayDays: 1,
                                channel: 'WHATSAPP',
                                templateSubject: 'Welcome & Next Steps',
                                templateBody: 'Hi {{name}}, thanks for contacting us! Here is a quick 2-min overview of how we help teams automate follow-ups.'
                            },
                            {
                                delayDays: 3,
                                channel: 'EMAIL',
                                templateSubject: 'Case Study & Client Results',
                                templateBody: 'Hi {{name}}, sharing how Tech Solutions increased lead conversion by 35% using our AI workflow.'
                            },
                            {
                                delayDays: 7,
                                channel: 'EMAIL',
                                templateSubject: 'Exclusive Demo Offer',
                                templateBody: 'Hi {{name}}, we have 2 open slots for a customized live demo this week. Would Thursday work for you?'
                            },
                            {
                                delayDays: 14,
                                channel: 'WHATSAPP',
                                templateSubject: 'Final Re-engagement Check',
                                templateBody: 'Hi {{name}}, following up one last time regarding your interest in automating your sales follow-ups!'
                            }
                        ]
                    }
                },
                include: { steps: true }
            });
            sequences = [newSeq];
        }

        res.json(sequences);
    } catch (error) {
        console.error('Error fetching sequences:', error);
        res.status(500).json({ error: 'Failed to fetch automation sequences' });
    }
});

const aiRoutes = require('./ai');

function extractCallInsightsLocally(customerName, rawNotes) {
    const isArabic = /[\u0600-\u06FF]/.test(rawNotes);
    const notesClean = rawNotes.trim();

    let sentiment = 'POSITIVE';
    const lower = notesClean.toLowerCase();
    if (lower.includes('angry') || lower.includes('cancel') || lower.includes('غاضب') || lower.includes('إلغاء') || lower.includes('مشكلة')) {
        sentiment = 'NEGATIVE';
    } else if (lower.includes('رخيص') || lower.includes('غالي') || lower.includes('سعر') || lower.includes('ميزانية') || lower.includes('price') || lower.includes('expensive')) {
        sentiment = 'NEUTRAL';
    }

    let aiSummary = '';
    let objections = '';
    let actionItems = '';

    if (isArabic) {
        if (notesClean.length <= 15) {
            if (notesClean.includes('رخيص')) {
                aiSummary = `• مناقشة التسعير والباقات المتاحة مع العميل ${customerName}.\n• أفاد العميل بأن السعر ممتاز/رخيص ("${notesClean}") واستفسر عن تفاصيل الباقة والخدمات المشمولة.`;
                objections = `1. الاستفسار عن مدى شمولية الباقة الاقتصادية ومطابقتها لكافة احتياجات الفريق.`;
                actionItems = `1. إرسال جدول مقارنة المميزات بين الباقات لـ ${customerName}.\n2. الترتيب لتأكيد الباقة المناسبة والبدء في الإعداد.`;
            } else if (notesClean.includes('غالي') || notesClean.includes('سعر') || notesClean.includes('ميزانية')) {
                aiSummary = `• استعراض الهيكل المالي وعرض السعر مع العميل ${customerName}.\n• أبدى العميل تحفظاً على التكلفة والميزانية المتاحة.`;
                objections = `1. تحفظ على التكلفة الإجمالية والطلب بتقديم خصم أو جدولة الدفعات.`;
                actionItems = `1. إعداد عرض تجاري مرن يشمل خصم الاشتراك السنوي لـ ${customerName}.\n2. جدولة مكالمة متابعة لبحث خيارات التسهيلات المالية.`;
            } else {
                aiSummary = `• ملاحظة المكالمة المباشرة للعميل ${customerName}:\n• "${notesClean}"`;
                objections = `1. متابعة التفاصيل التشغيلية واستكمال البيانات المطلوبة.`;
                actionItems = `1. التواصل الفوري مع ${customerName} ومتابعة خطوات إغلاق الصفقة.`;
            }
        } else {
            const sentences = notesClean.split(/[.\n!؟]/).map(s => s.trim()).filter(Boolean);
            const bullets = sentences.slice(0, 3).map(s => `• ${s}`).join('\n');
            aiSummary = `ملخص المكالمة مع العميل ${customerName}:\n${bullets || `• ${notesClean}`}`;

            if (notesClean.includes('غالي') || notesClean.includes('رخيص') || notesClean.includes('سعر') || notesClean.includes('ميزانية')) {
                objections = `1. استفسارات وملاحظات مالية متعلقة بالأسعار والميزانية في نص المكالمة.\n2. طلب التحقق من العائد على الاستثمار قبل التعاقد.`;
                actionItems = `1. إرسال التحليل المالي والعرض الخاص للعميل ${customerName}.\n2. جدولة اجتماع مع مدير المبيعات لإتمام الصفقة.`;
            } else {
                objections = `1. استفسارات حول آلية العمل وتفاصيل التطبيق التشغيلي.\n2. التأكد من جدول التسليم والاستجابة الفنية.`;
                actionItems = `1. تقديم عرض توضيحي (Demo) مخصص وتزويد ${customerName} بالتفاصيل.\n2. إنشاء مهمة متابعة تلقائية في النظام.`;
            }
        }
    } else {
        if (notesClean.length <= 15) {
            if (lower.includes('cheap') || lower.includes('low')) {
                aiSummary = `• Pricing overview with ${customerName}.\n• Client noted entry rate ("${notesClean}") and requested tier breakdown.`;
                objections = `1. Confirmation of core features included in entry-level package.`;
                actionItems = `1. Send detailed tier feature matrix to ${customerName}.\n2. Conduct follow-up call to confirm package selection.`;
            } else if (lower.includes('price') || lower.includes('expensive') || lower.includes('budget')) {
                aiSummary = `• Commercial proposal review with ${customerName}.\n• Client raised concerns regarding budget limits.`;
                objections = `1. Concern over total implementation cost and payment schedule flexibility.`;
                actionItems = `1. Send customized proposal with flexible payment options to ${customerName}.\n2. Schedule follow-up call to finalize agreement.`;
            } else {
                aiSummary = `• Direct call note logged for ${customerName}:\n• "${notesClean}"`;
                objections = `1. Operational follow-up and requirement alignment.`;
                actionItems = `1. Follow up with ${customerName} to advance deal to next stage.`;
            }
        } else {
            const sentences = notesClean.split(/[.\n!]/).map(s => s.trim()).filter(Boolean);
            const bullets = sentences.slice(0, 3).map(s => `• ${s}`).join('\n');
            aiSummary = `Summary of call with ${customerName}:\n${bullets || `• ${notesClean}`}`;

            objections = `1. Key points raised during call: "${notesClean.substring(0, 80)}..."`;
            actionItems = `1. Send proposal and follow-up docs to ${customerName}.\n2. Execute auto-scheduled CRM follow-up task.`;
        }
    }

    return { aiSummary, objections, actionItems, sentiment };
}

/**
 * POST /api/automations/summarize-call
 * AI Call Notes Summarizer & Extractor
 */
router.post('/summarize-call', async (req, res) => {
    try {
        const { customerId, rawNotes } = req.body;

        if (!rawNotes) {
            return res.status(400).json({ error: 'Raw notes are required' });
        }

        let customer = null;
        if (customerId) {
            customer = await prisma.customer.findUnique({
                where: { id: customerId }
            });
        }

        const customerName = customer ? customer.name : 'Customer';

        let aiSummary = '';
        let objections = '';
        let actionItems = '';
        let sentiment = 'POSITIVE';

        // Attempt LLM call if API key configured
        const systemPrompt = `You are MicroMind Agentic AI Call & Meeting Extractor.
Analyze the user's meeting/call transcript and extract structured insights.
Return ONLY a raw valid JSON object with keys:
{
  "aiSummary": "Concise 2-3 bullet point summary of the conversation based strictly on input",
  "objections": "1-2 specific client objections or concerns raised in the text",
  "actionItems": "1-2 actionable follow-up tasks for the team",
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE"
}`;
        const userPrompt = `Customer Name: ${customerName}\nNotes Transcript: "${rawNotes}"`;

        if (aiRoutes.callLlmApi) {
            const llmResult = await aiRoutes.callLlmApi(systemPrompt, userPrompt);
            if (llmResult) {
                try {
                    const cleanedJson = llmResult.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanedJson);
                    if (parsed.aiSummary) aiSummary = parsed.aiSummary;
                    if (parsed.objections) objections = parsed.objections;
                    if (parsed.actionItems) actionItems = parsed.actionItems;
                    if (parsed.sentiment) sentiment = parsed.sentiment;
                } catch (e) {
                    console.warn('Failed to parse LLM JSON output for summarize-call, fallback to local engine:', e);
                }
            }
        }

        // Dynamic local engine fallback if LLM not configured or returned empty
        if (!aiSummary) {
            const localInsights = extractCallInsightsLocally(customerName, rawNotes);
            aiSummary = localInsights.aiSummary;
            objections = localInsights.objections;
            actionItems = localInsights.actionItems;
            sentiment = localInsights.sentiment;
        }

        // Auto-create CallSummary record if customer specified
        let summaryRecord = null;
        if (customerId && customer) {
            summaryRecord = await prisma.callSummary.create({
                data: {
                    customerId,
                    rawNotes,
                    aiSummary,
                    objections,
                    actionItems,
                    sentiment
                }
            });

            // Log interaction automatically
            await prisma.interaction.create({
                data: {
                    customerId,
                    channel: 'CALL',
                    summary: `AI Summary: ${aiSummary.substring(0, 150)}...`,
                    sentiment
                }
            });

            // Auto-create follow-up task
            await prisma.followUpTask.create({
                data: {
                    organizationId: req.user.organizationId || customer.organizationId,
                    customerId,
                    title: `Execute Action Items for ${customerName}`,
                    description: actionItems,
                    type: 'EMAIL',
                    status: 'PENDING',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    aiSuggestedMsg: `Hi ${customerName}, following up on our call. As discussed, I am attaching the action items and commercial proposal...`
                }
            });
        }

        res.json({
            summary: summaryRecord,
            aiSummary,
            objections,
            actionItems,
            sentiment
        });
    } catch (error) {
        console.error('Error summarizing call:', error);
        res.status(500).json({ error: 'Failed to summarize call notes' });
    }
});

module.exports = router;
