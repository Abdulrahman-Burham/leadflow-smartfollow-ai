const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function generateDemoWalkthrough() {
    console.log('🎥 Starting Complete Login + App Walkthrough Capture...');

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--window-size=1920,1080', '--no-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();
    const artifactDir = 'C:\\Users\\abdul\\.gemini\\antigravity\\brain\\3437be1a-e9fc-4ce1-9eb1-8b4769709f64';
    const framesDir = path.join(artifactDir, 'demo_recorded_frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

    const capturedFrames = [];

    const capture = async (captionAr, captionEn) => {
        const frameIndex = capturedFrames.length;
        const filename = `frame_${String(frameIndex).padStart(4, '0')}.png`;
        const fp = path.join(framesDir, filename);
        await page.screenshot({ path: fp, type: 'png' });
        capturedFrames.push({
            filename,
            path: fp,
            ar: captionAr,
            en: captionEn
        });
        console.log(`📸 Captured frame ${frameIndex}: ${captionEn}`);
    };

    // 0. START AT LOGIN SCREEN
    console.log('📍 Scene 0: Login Screen & Authentication');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await capture('شاشة تسجيل الدخول وأمن النظام (Login & Security Screen)', 'Login Screen & RBAC Security Authentication');

    // Type Username
    const usernameInput = await page.$('input[type="text"]');
    if (usernameInput) {
        await usernameInput.type('admin@micromind.com', { delay: 50 });
        await capture('إدخال اسم المستخدم والبريد الإلكتروني (admin@micromind.com)', 'Entering Admin Username (admin@micromind.com)');
    }

    // Type Password
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
        await passwordInput.type('admin123', { delay: 50 });
        await capture('إدخال كلمة المرور واستكمال المصادقة', 'Entering Secure Password Credentials');
    }

    // Click Submit / Login Button
    const loginBtn = await page.$('button[type="submit"]');
    if (loginBtn) {
        await loginBtn.click();
        console.log('🔑 Clicked Login Button');
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        await new Promise(r => setTimeout(r, 1200));
    }

    // 1. DASHBOARD OVERVIEW
    console.log('📍 Scene 1: Dashboard Overview');
    await capture('تسجيل الدخول وفتح الصفحة الرئيسية ومؤشرات الأداء (Dashboard KPIs)', 'Authenticated Dashboard Overview & Sales Pipeline KPIs');
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise(r => setTimeout(r, 800));
    await capture('تحليل صحة الصفقات ونشاط المحصلين (Pipeline Health)', 'Real-time Deal Health & Recent Operations Audit');

    // 2. SMARTFOLLOW AI
    console.log('📍 Scene 2: SmartFollow AI & WhatsApp Escalation');
    await page.goto('http://localhost:5173/smart-follow', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await capture('صفحة المتابعة الذكية SmartFollow AI وخطة الإجراءات', 'SmartFollow AI Action Queue & Risk Scoring');

    // Click Escalation button
    try {
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && (text.includes('تصعيد') || text.includes('Escalation') || text.includes('WhatsApp'))) {
                await btn.click();
                console.log('🟢 Clicked WhatsApp Escalation button');
                await new Promise(r => setTimeout(r, 1200));
                break;
            }
        }
    } catch(e) {
        console.warn('Click error:', e);
    }
    await capture('تنشيط تصعيد الواتساب الفوري بضغطة زر واحدة (1-Click WhatsApp Escalation)', '1-Click Urgent WhatsApp Escalation Modal Triggered');

    // 3. SETTINGS & LLM API
    console.log('📍 Scene 3: AI Engine Settings & Test');
    await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await capture('ربط نماذج الذكاء الاصطناعي (Groq, Gemini, OpenRouter)', 'AI Engine & LLM API Integration Settings');

    // Click Test Connection button
    try {
        const testBtns = await page.$$('button');
        for (const btn of testBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && (text.includes('Test Connection') || text.includes('اختبار الاتصال'))) {
                await btn.click();
                console.log('⚡ Clicked Test Connection button');
                await new Promise(r => setTimeout(r, 2000));
                break;
            }
        }
    } catch(e) {
        console.warn('Test connection error:', e);
    }
    await capture('اختبار الاتصال المباشر بنماذج الذكاء الاصطناعي (Connected ✅)', 'Live LLM Connection Test Verified (Connected ✅)');

    // 4. AUTOMATIONS HUB
    console.log('📍 Scene 4: Automations Hub');
    await page.goto('http://localhost:5173/automations', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await capture('مركز الأتمتة وسلاسل المتابعة التلقائية 14 يوماً (Automations Hub)', 'Automations Hub & 14-Day Drip Sequences');

    await browser.close();
    console.log(`✅ Automated Walkthrough complete with ${capturedFrames.length} high-res scenes!`);

    // Write manifest JSON
    const manifestPath = path.join(artifactDir, 'demo_recorded_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(capturedFrames, null, 2));
    console.log('📄 Manifest written to:', manifestPath);
}

generateDemoWalkthrough();
