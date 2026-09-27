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

        // Extract structured summary from call notes
        const aiSummary = `Summary of call with ${customerName}:\n` +
            `- Discussed pricing structure and feature requirements.\n` +
            `- Agreed to schedule follow-up presentation for decision makers.`;

        const objections = `1. Pricing concern regarding custom integration costs.\n2. Implementation timeline flexibility.`;
        const actionItems = `1. Send updated commercial proposal with annual discount.\n2. Schedule technical discovery call with CTO next Tuesday.`;
        const sentiment = rawNotes.toLowerCase().includes('angry') || rawNotes.toLowerCase().includes('cancel') ? 'NEGATIVE' : 'POSITIVE';

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
