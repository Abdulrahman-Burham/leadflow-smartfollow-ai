/**
 * Dashboards & AI Intelligence Layers Routes
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Auth Middleware
const authCheck = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8');
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.use(authCheck);

// Default Pre-Built AI Intelligence Dashboards
let inMemoryDashboards = [
    {
        id: 'dash-sales-portfolio',
        title: 'Strategic Sales & Revenue Portfolio',
        description: 'Real-time AI analytics mapping deal health scores, sales velocity, and closed-won revenue across active sales reps.',
        queryGeneratorPath: 'https://workflow.engine/api/v1/analytics/sales-portfolio',
        executionEngineApi: 'https://gateway.api/v1/ai/pipeline',
        autoSyncFrequency: 'Real-time (Default)',
        isPublic: true,
        coverUrl: '/assets/logo.png',
        category: 'Sales Intelligence',
        stats: {
            totalPipeline: '$128,500',
            activeDeals: 12,
            winRate: '68.4%'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'dash-whatsapp-escalations',
        title: 'SmartFollow AI & WhatsApp Risk Radar',
        description: 'Autonomous SLA monitor tracking churn risk scores, high-priority WhatsApp escalations, and team SLA response times.',
        queryGeneratorPath: 'https://workflow.engine/api/v1/analytics/escalations',
        executionEngineApi: 'https://gateway.api/v1/ai/escalations',
        autoSyncFrequency: '1 Min Sync',
        isPublic: true,
        coverUrl: '/assets/logo.png',
        category: 'Operations & SLA',
        stats: {
            churnRiskDeals: 3,
            slaResponseRate: '98.2%',
            escalationsResolved: 14
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'dash-cash-collections',
        title: 'Omnichannel Collections & Cash Velocity',
        description: 'Executive financial BI dashboard monitoring field visit check-ins, payment recovery rates, and cash collections compliance.',
        queryGeneratorPath: 'https://workflow.engine/api/v1/analytics/collections',
        executionEngineApi: 'https://gateway.api/v1/ai/finance',
        autoSyncFrequency: 'Real-time (Default)',
        isPublic: true,
        coverUrl: '/assets/logo.png',
        category: 'Financial Analytics',
        stats: {
            cashCollectedThisMonth: '$45,200',
            auditCompliance: '99.4%',
            activeCollectors: 5
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'dash-churn-patrol',
        title: 'Customer Retention & Churn Patrol Radar',
        description: 'Predictive AI model identifying stalled opportunities, customer sentiment drop-offs, and automated win-back flow performance.',
        queryGeneratorPath: 'https://workflow.engine/api/v1/analytics/churn-patrol',
        executionEngineApi: 'https://gateway.api/v1/ai/churn',
        autoSyncFrequency: 'Real-time (Default)',
        isPublic: true,
        coverUrl: '/assets/logo.png',
        category: 'Churn Prevention',
        stats: {
            stalledLeads: 2,
            retentionScore: '94.8%',
            winbackConversion: '42.0%'
        },
        createdAt: new Date().toISOString()
    }
];

/**
 * GET /api/dashboards
 * Fetch all AI Intelligence Layer Dashboards
 */
router.get('/', (req, res) => {
    res.json(inMemoryDashboards);
});

/**
 * GET /api/dashboards/:id
 */
router.get('/:id', (req, res) => {
    const dash = inMemoryDashboards.find(d => d.id === req.params.id);
    if (!dash) {
        return res.status(404).json({ error: 'Dashboard not found' });
    }
    res.json(dash);
});

/**
 * POST /api/dashboards
 * Create / Deploy a new Intelligence Layer Dashboard
 */
router.post('/', (req, res) => {
    const { title, description, queryGeneratorPath, executionEngineApi, autoSyncFrequency, isPublic, coverUrl } = req.body;

    const newDash = {
        id: `dash-${Date.now()}`,
        title: title || 'New Strategic Intelligence Layer',
        description: description || 'Custom AI-powered analytical view.',
        queryGeneratorPath: queryGeneratorPath || 'https://workflow.engine/api/v1/analytics/custom',
        executionEngineApi: executionEngineApi || 'https://gateway.api/v1/ai/custom',
        autoSyncFrequency: autoSyncFrequency || 'Real-time (Default)',
        isPublic: isPublic !== undefined ? isPublic : true,
        coverUrl: coverUrl || '/assets/logo.png',
        category: 'Custom Analytics',
        createdAt: new Date().toISOString()
    };

    inMemoryDashboards.unshift(newDash);
    res.status(201).json(newDash);
});

/**
 * PUT /api/dashboards/:id
 */
router.put('/:id', (req, res) => {
    const index = inMemoryDashboards.findIndex(d => d.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Dashboard not found' });
    }
    inMemoryDashboards[index] = { ...inMemoryDashboards[index], ...req.body };
    res.json(inMemoryDashboards[index]);
});

/**
 * DELETE /api/dashboards/:id
 */
router.delete('/:id', (req, res) => {
    inMemoryDashboards = inMemoryDashboards.filter(d => d.id !== req.params.id);
    res.json({ success: true, message: 'Dashboard deleted successfully' });
});

/**
 * POST /api/dashboards/:id/execute
 */
router.post('/:id/execute', (req, res) => {
    res.json({
        data: [
            { metric: 'Pipeline Revenue', value: 128500 },
            { metric: 'Health Score Avg', value: 86 }
        ],
        columns: ['metric', 'value']
    });
});

module.exports = router;
