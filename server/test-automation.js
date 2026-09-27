/**
 * MicroMind / SmartFollow AI — Automated End-to-End API Test Suite
 */

const BASE_URL = 'http://localhost:3000';

async function runAutomationTests() {
    console.log('====================================================');
    console.log('🧪 MicroMind SmartFollow AI — E2E Automation Test Suite');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;
    let adminToken = '';
    let userToken = '';
    let createdCustomerId = '';
    let createdTaskId = '';

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.log(`❌ [FAIL] ${name}: ${err.message}`);
            failed++;
        }
    };

    // 1. Health Check Test
    await test('API Health Check Endpoint (/api/health)', async () => {
        const res = await fetch(`${BASE_URL}/api/health`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.status !== 'ok') throw new Error('Health status not ok');
    });

    // 2. Admin Login Test
    await test('Admin Authentication Login (/api/auth/login)', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@micromind.com', password: 'admin123' })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.token) throw new Error('Token not returned');
        adminToken = data.token;
    });

    // 3. Sales Rep Login Test
    await test('Sales Representative Authentication Login (/api/auth/login)', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@acme.com', password: 'user123' })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.token) throw new Error('Token not returned');
        userToken = data.token;
    });

    // 4. Create Customer Lead Test
    await test('SmartFollow Lead Creation (/api/customers)', async () => {
        const res = await fetch(`${BASE_URL}/api/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'AutoTest Client',
                company: 'Future Systems Inc',
                email: 'test@futuresystems.com',
                phone: '+201009998877',
                stage: 'NEW_LEAD',
                dealValue: 18500,
                notes: 'Automated test customer lead'
            })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.id) throw new Error('Customer ID not created');
        createdCustomerId = data.id;
    });

    // 5. Fetch Customers & Tasks Test
    await test('SmartFollow Pipeline Directory & Tasks Retrieval', async () => {
        const res = await fetch(`${BASE_URL}/api/customers`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.customers)) throw new Error('Invalid customer list format');

        const tasksRes = await fetch(`${BASE_URL}/api/customers/followups/tasks`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!tasksRes.ok) throw new Error(`Tasks Status ${tasksRes.status}`);
        const tasks = await tasksRes.json();
        if (tasks.length > 0) {
            createdTaskId = tasks[0].id;
        }
    });

    // 6. AI Follow-up Suggestion Test
    await test('SmartFollow AI Message Generation (/api/customers/:id/ai-suggest)', async () => {
        if (!createdCustomerId) throw new Error('No customer ID');
        const res = await fetch(`${BASE_URL}/api/customers/${createdCustomerId}/ai-suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ channel: 'whatsapp', promptHint: 'discount' })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.suggestedMessage || !data.suggestedMessage.includes('15%')) {
            throw new Error('AI suggestion failed or missing 15% discount');
        }
    });

    // 7. Complete Task Test
    await test('Follow-up Task Completion (/api/customers/followups/tasks/:taskId)', async () => {
        if (!createdTaskId) return;
        const res = await fetch(`${BASE_URL}/api/customers/followups/tasks/${createdTaskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'COMPLETED', notes: 'Automated test task completed' })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.status !== 'COMPLETED') throw new Error('Task status not updated to COMPLETED');
    });

    // 8. AI Meeting Notes Summarizer Test
    await test('AI Meeting Notes Summarizer (/api/automations/summarize-call)', async () => {
        const res = await fetch(`${BASE_URL}/api/automations/summarize-call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                customerId: createdCustomerId,
                rawNotes: 'Client expressed strong interest in Pro tier. Budget is 20k. Requested follow-up call on Monday.'
            })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.aiSummary || !data.actionItems) throw new Error('Summary or action items missing');
    });

    // 9. Drip Sequences Test
    await test('Automated Drip Sequences Retrieval (/api/automations/sequences)', async () => {
        const res = await fetch(`${BASE_URL}/api/automations/sequences`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('No sequences returned');
    });

    // 10. White-Label Branding Security Test (RBAC Check)
    await test('RBAC Security Check — Sales Rep Cannot Patch Branding', async () => {
        const res = await fetch(`${BASE_URL}/api/branding`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ portalTitle: 'Unauthorized Title' })
        });
        if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 11. Customer Lead Deletion Test
    await test('Customer Lead Deletion (/api/customers/:id)', async () => {
        if (!createdCustomerId) throw new Error('No customer ID to delete');
        const res = await fetch(`${BASE_URL}/api/customers/${createdCustomerId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
    });

    console.log('\n====================================================');
    console.log(`📊 Automation Test Execution Summary:`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total:  ${passed + failed}`);
    console.log('====================================================\n');
}

runAutomationTests();
