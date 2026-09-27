/**
 * SmartFollow AI — Customer & Follow-up Automation Routes
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
 * GET /api/customers
 * Returns customer list with optional search, stage filter, and sorting
 */
router.get('/', async (req, res) => {
    try {
        const { search, stage, sortBy } = req.query;
        const orgId = req.user.organizationId;

        const where = {
            ...(orgId ? { organizationId: orgId } : {})
        };

        if (stage && stage !== 'ALL') {
            where.stage = stage;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { company: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            include: {
                followUpTasks: {
                    where: { status: 'PENDING' },
                    orderBy: { dueDate: 'asc' }
                },
                interactions: {
                    take: 3,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: sortBy === 'nextFollowUp' 
                ? { nextFollowUpAt: 'asc' }
                : sortBy === 'dealValue'
                ? { dealValue: 'desc' }
                : { createdAt: 'desc' }
        });

        // Pipeline stats calculation
        const allCustomers = await prisma.customer.findMany({
            where: orgId ? { organizationId: orgId } : {}
        });

        const stats = {
            total: allCustomers.length,
            totalPipelineValue: allCustomers.reduce((sum, c) => sum + (c.dealValue || 0), 0),
            byStage: {
                NEW_LEAD: allCustomers.filter(c => c.stage === 'NEW_LEAD').length,
                CONTACTED: allCustomers.filter(c => c.stage === 'CONTACTED').length,
                PROPOSAL_SENT: allCustomers.filter(c => c.stage === 'PROPOSAL_SENT').length,
                FOLLOW_UP_NEEDED: allCustomers.filter(c => c.stage === 'FOLLOW_UP_NEEDED').length,
                CLOSED_WON: allCustomers.filter(c => c.stage === 'CLOSED_WON').length,
                CLOSED_LOST: allCustomers.filter(c => c.stage === 'CLOSED_LOST').length,
            },
            pendingFollowUps: allCustomers.filter(c => c.nextFollowUpAt && new Date(c.nextFollowUpAt) <= new Date()).length
        };

        res.json({ customers, stats });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

/**
 * POST /api/customers
 * Create a new customer lead
 */
router.post('/', async (req, res) => {
    try {
        const { name, company, email, phone, stage, dealValue, notes, nextFollowUpAt } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Customer name is required' });
        }

        // Get organization ID
        let orgId = req.user.organizationId;
        if (!orgId) {
            const firstOrg = await prisma.organization.findFirst();
            orgId = firstOrg.id;
        }

        const customer = await prisma.customer.create({
            data: {
                organizationId: orgId,
                name,
                company: company || null,
                email: email || null,
                phone: phone || null,
                stage: stage || 'NEW_LEAD',
                dealValue: dealValue ? parseFloat(dealValue) : 0,
                healthScore: 90,
                notes: notes || null,
                nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            }
        });

        // Automatically create initial follow-up task
        await prisma.followUpTask.create({
            data: {
                organizationId: orgId,
                customerId: customer.id,
                title: `Initial Follow-up: ${name}`,
                description: `Conduct discovery call and introduce SmartFollow AI solutions to ${company || name}.`,
                type: 'CALL',
                status: 'PENDING',
                dueDate: customer.nextFollowUpAt,
                aiSuggestedMsg: `Hi ${name}, following up from SmartFollow AI regarding your interest in automating customer follow-ups...`
            }
        });

        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

/**
 * GET /api/customers/followups/tasks
 * Get all follow-up tasks for current organization
 */
router.get('/followups/tasks', async (req, res) => {
    try {
        const orgId = req.user.organizationId;
        const tasks = await prisma.followUpTask.findMany({
            where: orgId ? { organizationId: orgId } : {},
            include: {
                customer: true
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch follow-up tasks' });
    }
});

/**
 * PATCH /api/customers/followups/tasks/:taskId
 * Update task status (COMPLETED, CANCELLED, etc.)
 */
router.patch('/followups/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, notes } = req.body;

        const task = await prisma.followUpTask.update({
            where: { id: taskId },
            data: { status }
        });

        if (status === 'COMPLETED' && task.customerId) {
            // Log interaction
            await prisma.interaction.create({
                data: {
                    customerId: task.customerId,
                    channel: task.type || 'CALL',
                    summary: notes || `Completed task: ${task.title}`,
                    sentiment: 'POSITIVE'
                }
            });

            // Update customer last contacted date & advance follow-up date
            await prisma.customer.update({
                where: { id: task.customerId },
                data: {
                    lastContactedAt: new Date(),
                    nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                }
            });
        }

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

/**
 * PATCH /api/customers/:id
 * Update customer details or stage
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stage, notes, nextFollowUpAt, dealValue, healthScore } = req.body;

        const updated = await prisma.customer.update({
            where: { id },
            data: {
                ...(stage && { stage }),
                ...(notes && { notes }),
                ...(dealValue !== undefined && { dealValue: parseFloat(dealValue) }),
                ...(healthScore !== undefined && { healthScore: parseInt(healthScore) }),
                ...(nextFollowUpAt && { nextFollowUpAt: new Date(nextFollowUpAt) })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

/**
 * POST /api/customers/:id/ai-suggest
 * Generate AI-suggested follow-up message using client history
 */
router.post('/:id/ai-suggest', async (req, res) => {
    try {
        const { id } = req.params;
        const { tone = 'professional', channel = 'email', promptHint = '' } = req.body;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: { interactions: { take: 3, orderBy: { createdAt: 'desc' } } }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        let message = '';
        const isArabicName = /[\u0600-\u06FF]/.test(customer.name);

        if (promptHint === 'discount') {
            if (channel === 'whatsapp') {
                message = `أهلاً ${customer.name} 👋✨\nعندنا خبر ممتاز لك! صممنا خصم خاص 15% حصرياً لـ ${customer.company || 'حضرتك'} على باقات أتمتة المتابعات SmartFollow AI.\nالعرض ساري لمدة 48 ساعة فقط ⏳. تحب أرسل لك التفاصيل؟ 🚀`;
            } else {
                message = `Subject: 🏷️ Exclusive 15% Discount Offer for ${customer.company || customer.name} — SmartFollow AI\n\nDear ${customer.name},\n\nWe are pleased to offer an exclusive 15% discount on our SmartFollow AI Automation platform for ${customer.company || 'your team'}.\n\nThis limited-time offer is valid for the next 48 hours to help you automate customer outreach and boost deal conversions.\n\nShall we schedule a brief 5-minute call today to activate your discount?\n\nBest regards,\nSmartFollow AI Team`;
            }
        } else if (promptHint === 'meeting') {
            if (channel === 'whatsapp') {
                message = `سعيد جداً بالتواصل معك اليوم ${customer.name} 🤝!\nبناءً على اجتماعنا الأخير، جهزنا العرض المخصص لـ ${customer.company || 'شركتكم'}.\nهل يناسبك نلتقي غداً في نفس الموعد لتأكيد التفاصيل؟ 📑`;
            } else {
                message = `Subject: Post-Meeting Follow-up & Next Steps — ${customer.company || customer.name}\n\nHi ${customer.name},\n\nThank you for the productive discussion earlier today.\n\nAs agreed, I have put together the tailored implementation proposal for SmartFollow AI. We are confident this will streamline your client management and follow-up sequence.\n\nPlease let me know if tomorrow at 2:00 PM works for a quick 10-minute confirmation call.\n\nWarm regards,\nSmartFollow AI Team`;
            }
        } else if (channel === 'whatsapp') {
            message = `مرحباً ${customer.name} 👋، أتمنى لك يوماً سعيداً!\nنحاول المتابعة معك بخصوص ${customer.company ? 'شركة ' + customer.company : 'طلبكم الأخير'}.\nهل يناسبك التواصل اليوم لمناقشة الخطوة التالية؟ 🚀`;
        } else if (channel === 'call') {
            message = `📞 Call Script (${customer.name}):\n1. Greeting & Rapport: "Hi ${customer.name}, following up from SmartFollow AI."\n2. Context Check: Reference deal status (${customer.stage}) and value ($${(customer.dealValue || 0).toLocaleString()}).\n3. Key Question: "Did you have a chance to review our automated follow-up proposal?"\n4. Goal: Secure a 15-min demo appointment or close deal.`;
        } else {
            message = `Subject: Quick follow-up regarding ${customer.company || 'your project'} — SmartFollow AI\n\nHi ${customer.name},\n\nI hope you are having a productive week.\n\nI wanted to reach out regarding our previous conversation about ${customer.notes || 'enhancing your sales process'}.\n\nWe have prepared a customized demo for ${customer.company || 'your team'} demonstrating how SmartFollow AI automates customer follow-ups and increases conversion by 35%.\n\nWould you have 10 minutes available tomorrow or Thursday for a quick review?\n\nBest regards,\nSmartFollow AI Team`;
        }

        res.json({
            customerId: customer.id,
            suggestedMessage: message,
            channel,
            tone
        });
    } catch (error) {
        console.error('Error generating AI suggestion:', error);
        res.status(500).json({ error: 'Failed to generate AI suggestion' });
    }
});

/**
 * DELETE /api/customers/:id
 * Delete customer and associated tasks, interactions, and summaries
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete associated records first
        await prisma.followUpTask.deleteMany({ where: { customerId: id } });
        await prisma.interaction.deleteMany({ where: { customerId: id } });
        await prisma.callSummary.deleteMany({ where: { customerId: id } });

        const deleted = await prisma.customer.delete({
            where: { id }
        });

        res.json({ message: 'Customer deleted successfully', id });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

module.exports = router;
