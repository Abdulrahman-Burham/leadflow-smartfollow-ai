/**
 * User & Team Management Routes with RBAC Security
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId || decoded.id },
            include: { memberships: true }
        });

        if (user) {
            if (!orgId && user.memberships.length > 0) {
                orgId = user.memberships[0].organizationId;
            }
            req.user = { 
                ...decoded, 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                organizationId: orgId 
            };
        } else {
            req.user = { ...decoded, organizationId: orgId };
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

router.use(authCheck);

/**
 * GET /api/users
 * List all users in current organization (Allowed for ADMIN, MANAGER, USER, VIEWER)
 */
router.get('/', async (req, res) => {
    try {
        const { search, role } = req.query;
        const orgId = req.user.organizationId;

        const where = {};

        if (orgId) {
            where.memberships = {
                some: { organizationId: orgId }
            };
        }

        if (role && role !== 'ALL') {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { displayName: { contains: search } },
                { email: { contains: search } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                active: true,
                currentOrganizationId: true,
                createdAt: true,
                memberships: {
                    include: {
                        organization: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * POST /api/users
 * Add a new user (Restricted to ADMIN and MANAGER)
 */
router.post('/', async (req, res) => {
    try {
        // Security RBAC Check
        if (req.user.role === 'VIEWER' || req.user.role === 'USER') {
            return res.status(403).json({ error: 'Access Denied: Viewers and Sales Reps cannot add new users.' });
        }

        const { displayName, email, password, role } = req.body;

        if (!displayName || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Only ADMIN can create another ADMIN
        if (role === 'ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied: Only Administrators can create ADMIN users.' });
        }

        // Check if user email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        let orgId = req.user.organizationId;
        if (!orgId) {
            const firstOrg = await prisma.organization.findFirst();
            orgId = firstOrg.id;
        }

        if (existingUser) {
            // Check if already member
            const existingMember = await prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId: orgId,
                        userId: existingUser.id
                    }
                }
            });

            if (existingMember) {
                return res.status(400).json({ error: 'User is already a member of this organization' });
            }

            // Link existing user to organization
            await prisma.organizationMember.create({
                data: {
                    organizationId: orgId,
                    userId: existingUser.id,
                    role: role || 'MEMBER'
                }
            });

            return res.status(200).json({ message: 'User added to organization', user: existingUser });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                displayName,
                email,
                passwordHash,
                role: role || 'USER',
                active: true,
                currentOrganizationId: orgId,
                memberships: {
                    create: {
                        organizationId: orgId,
                        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
                    }
                }
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                active: true,
                createdAt: true
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

/**
 * PATCH /api/users/:id
 * Update user details (Restricted to ADMIN and MANAGER)
 */
router.patch('/:id', async (req, res) => {
    try {
        // Security RBAC Check
        if (req.user.role === 'VIEWER' || req.user.role === 'USER') {
            return res.status(403).json({ error: 'Access Denied: Viewers and Sales Reps cannot modify user details or roles.' });
        }

        const { id } = req.params;
        const { displayName, role, active } = req.body;

        // Only ADMIN can assign ADMIN role
        if (role === 'ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied: Only Administrators can grant ADMIN role.' });
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                ...(displayName && { displayName }),
                ...(role && { role }),
                ...(active !== undefined && { active })
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                active: true
            }
        });

        // Sync OrganizationMember role if role was updated
        if (role && req.user.organizationId) {
            await prisma.organizationMember.updateMany({
                where: {
                    userId: id,
                    organizationId: req.user.organizationId
                },
                data: {
                    role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
                }
            }).catch(err => console.log('Org member update ignored:', err.message));
        }

        res.json(updated);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * DELETE /api/users/:id
 * Deactivate user (Restricted to ADMIN only)
 */
router.delete('/:id', async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access Denied: Only Administrators can deactivate users.' });
        }

        const { id } = req.params;
        await prisma.user.update({
            where: { id },
            data: { active: false }
        });
        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
});

module.exports = router;
