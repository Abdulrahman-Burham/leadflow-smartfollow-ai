const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting SmartFollow AI & Projects database seed...');

    // ============================================================================
    // CREATE DEMO ORGANIZATIONS
    // ============================================================================

    console.log('\n📦 Creating organizations...');

    const org1 = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corporation',
            slug: 'acme-corp',
            settings: JSON.stringify({
                timezone: 'America/New_York',
                dateFormat: 'MM/DD/YYYY'
            })
        }
    });
    console.log('✅ Created organization:', org1.name);

    const org2 = await prisma.organization.upsert({
        where: { slug: 'micromind-labs' },
        update: {},
        create: {
            name: 'MicroMind Labs',
            slug: 'micromind-labs',
            settings: JSON.stringify({
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD'
            })
        }
    });
    console.log('✅ Created organization:', org2.name);

    // ============================================================================
    // CREATE USERS
    // ============================================================================

    console.log('\n👥 Creating users...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@micromind.com' },
        update: {},
        create: {
            email: 'admin@micromind.com',
            passwordHash: adminPassword,
            displayName: 'Admin User',
            role: 'ADMIN',
            active: true,
            currentOrganizationId: org1.id
        }
    });
    console.log('✅ Created main admin user:', admin.email);

    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@acme.com' },
        update: {},
        create: {
            email: 'user@acme.com',
            passwordHash: userPassword,
            displayName: 'Sales Representative',
            role: 'USER',
            active: true,
            currentOrganizationId: org1.id
        }
    });
    console.log('✅ Created demo user:', user.email);

    // ============================================================================
    // CREATE ORGANIZATION MEMBERSHIPS & SUBSCRIPTIONS
    // ============================================================================

    await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org1.id, userId: admin.id } },
        update: {},
        create: { organizationId: org1.id, userId: admin.id, role: 'OWNER' }
    });

    await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org1.id, userId: user.id } },
        update: {},
        create: { organizationId: org1.id, userId: user.id, role: 'MEMBER' }
    });

    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    await prisma.subscription.upsert({
        where: { organizationId: org1.id },
        update: {},
        create: {
            organizationId: org1.id,
            plan: 'PRO',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: nextYear
        }
    });

    // ============================================================================
    // CREATE DEMO PROJECTS
    // ============================================================================

    console.log('\n🚀 Creating demo projects...');

    const proj1 = await prisma.project.create({
        data: {
            organizationId: org1.id,
            name: 'Website Redesign & Rebranding',
            description: 'Overhaul corporate website with Executive Gold V4 design system.',
            status: 'ACTIVE',
            color: '#E0AA3E',
            progress: 65,
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            createdBy: admin.id
        }
    });

    const proj2 = await prisma.project.create({
        data: {
            organizationId: org1.id,
            name: 'SmartFollow CRM Integration',
            description: 'Automate sales follow-up workflows and WhatsApp messaging.',
            status: 'ACTIVE',
            color: '#10B981',
            progress: 90,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            createdBy: admin.id
        }
    });

    console.log('✅ Created demo projects:', proj1.name, ',', proj2.name);

    // ============================================================================
    // CREATE SMARTFOLLOW AI CUSTOMERS & FOLLOW-UP TASKS
    // ============================================================================

    console.log('\n🎯 Creating SmartFollow AI customers & tasks...');

    const customer1 = await prisma.customer.create({
        data: {
            organizationId: org1.id,
            name: 'Ahmed Hassan',
            company: 'Tech Solutions LLC',
            email: 'ahmed@techsolutions.com',
            phone: '+20 100 123 4567',
            stage: 'PROPOSAL_SENT',
            healthScore: 85,
            dealValue: 15000,
            assignedTo: admin.id,
            lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            nextFollowUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            notes: 'Interested in Enterprise Tier. Waiting for final budget signoff from CEO.'
        }
    });

    const customer2 = await prisma.customer.create({
        data: {
            organizationId: org1.id,
            name: 'Sarah Miller',
            company: 'Apex Global Trading',
            email: 'sarah.m@apexglobal.com',
            phone: '+1 555 019 2834',
            stage: 'FOLLOW_UP_NEEDED',
            healthScore: 60,
            dealValue: 28000,
            assignedTo: user.id,
            lastContactedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            nextFollowUpAt: new Date(),
            notes: 'Requested custom integration details. High priority deal.'
        }
    });

    // Follow-up tasks
    await prisma.followUpTask.create({
        data: {
            organizationId: org1.id,
            customerId: customer1.id,
            title: 'Send Revised Commercial Proposal',
            description: 'Send updated pricing breakdown including 10% annual billing discount.',
            type: 'EMAIL',
            status: 'PENDING',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            aiSuggestedMsg: 'Hi Ahmed, following up on our proposal sent on Tuesday. I have attached the updated annual discount structure we discussed...'
        }
    });

    console.log('');
    console.log('🎉 SmartFollow AI & Projects database seeded successfully!');
    console.log('');
    console.log('📝 Credentials:');
    console.log('   Admin Login: admin@micromind.com / admin123');
    console.log('   Sales Rep:   user@acme.com / user123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
