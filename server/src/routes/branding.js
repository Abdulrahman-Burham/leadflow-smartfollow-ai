/**
 * White-Label Branding Hub Routes
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
 * GET /api/branding
 * Get current organization branding configuration
 */
router.get('/', async (req, res) => {
    try {
        let orgId = req.user.organizationId;
        if (!orgId) {
            const firstOrg = await prisma.organization.findFirst();
            orgId = firstOrg ? firstOrg.id : null;
        }

        if (!orgId) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                brandColor: true,
                portalTitle: true,
                settings: true
            }
        });

        res.json(org || {
            name: 'MicroMind Base SaaS',
            brandColor: '#E0AA3E',
            portalTitle: 'MicroMind Business Suite',
            logo: '/assets/logo.png'
        });
    } catch (error) {
        console.error('Error fetching branding:', error);
        res.status(500).json({ error: 'Failed to fetch branding config' });
    }
});

/**
 * PATCH /api/branding
 * Update white-label branding configuration (name, logo, brandColor, portalTitle)
 */
router.patch('/', async (req, res) => {
    try {
        if (req.user.role === 'VIEWER' || req.user.role === 'USER') {
            return res.status(403).json({ error: 'Access Denied: Only Admins and Managers can update branding settings.' });
        }

        let orgId = req.user.organizationId;
        if (!orgId) {
            const firstOrg = await prisma.organization.findFirst();
            orgId = firstOrg.id;
        }

        const { name, brandColor, portalTitle, logo } = req.body;

        const updated = await prisma.organization.update({
            where: { id: orgId },
            data: {
                ...(name && { name }),
                ...(brandColor && { brandColor }),
                ...(portalTitle && { portalTitle }),
                ...(logo && { logo })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating branding:', error);
        res.status(500).json({ error: 'Failed to update branding' });
    }
});

module.exports = router;
