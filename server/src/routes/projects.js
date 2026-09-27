/**
 * Projects Management Routes
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
 * GET /api/projects
 * List all projects with optional search & status filter
 */
router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query;
        const orgId = req.user.organizationId;

        const where = {
            ...(orgId ? { organizationId: orgId } : {})
        };

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const projects = await prisma.project.findMany({
            where,
            include: {
                tasks: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, color, startDate, endDate, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        let orgId = req.user.organizationId;
        if (!orgId) {
            const firstOrg = await prisma.organization.findFirst();
            orgId = firstOrg.id;
        }

        const project = await prisma.project.create({
            data: {
                organizationId: orgId,
                name,
                description: description || null,
                color: color || '#E0AA3E',
                status: status || 'ACTIVE',
                progress: 0,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                createdBy: req.user.userId || req.user.id
            }
        });

        // Add default initial task
        await prisma.projectTask.create({
            data: {
                projectId: project.id,
                title: `Kickoff & Setup: ${name}`,
                description: 'Initial project planning and team onboarding.',
                status: 'IN_PROGRESS',
                priority: 'HIGH'
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

/**
 * PATCH /api/projects/:id
 * Update project details
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status, progress, color } = req.body;

        const updated = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(status && { status }),
                ...(color && { color }),
                ...(progress !== undefined && { progress: parseInt(progress) })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.project.delete({ where: { id } });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
