const puppeteer = require('puppeteer-core');
const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appRootDir = 'D:\\learn\\micro mind\\YourApp';
const artifactDir = 'C:\\Users\\abdul\\.gemini\\antigravity\\brain\\3437be1a-e9fc-4ce1-9eb1-8b4769709f64';
const tempDir = path.join(appRootDir, 'scripts', 'temp_demo');

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// 1. SCENE DEFINITIONS & ARABIC NARRATIONS
const scenes = [
    {
        id: 0,
        name: "Login & RBAC Security",
        arText: "مرحباً بكم. نستعرض معكم اليوم مشروع ليد فلو دوت أي آي لإدارة المبيعات والمتابعة الذكية عبر الواتساب. تبدأ التجربة من شاشة تسجيل الدخول وأمن النظام المعتمد على الأدوار والصلاحيات.",
        url: "http://localhost:5173/login",
        action: async (page) => {
            await page.evaluate(() => localStorage.clear());
            await page.reload({ waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 1000));
            const uInput = await page.$('input[type="text"]');
            if (uInput) await uInput.type('admin@micromind.com', { delay: 40 });
            const pInput = await page.$('input[type="password"]');
            if (pInput) await pInput.type('admin123', { delay: 40 });
            const btn = await page.$('button[type="submit"]');
            if (btn) {
                await btn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
            }
        }
    },
    {
        id: 1,
        name: "Dashboard & Pipeline KPIs",
        arText: "بعد الدخول، تظهر الصفحة الرئيسية ومؤشرات أداء المبيعات الحية، حيث يمكنك متابعة إجمالي قيمة صفقات الفريق البالغة ستة وثمانين ألف دولار، مع تحليل صحة الصفقات وسجل المحصلين.",
        url: "http://localhost:5173/",
        action: async (page) => {
            await page.evaluate(() => window.scrollBy(0, 300));
            await new Promise(r => setTimeout(r, 800));
        }
    },
    {
        id: 2,
        name: "SmartFollow AI & WhatsApp Escalation",
        arText: "في صفحة المتابعة الذكية سمارت فولو، يحلل النظام إشارات الشراء. عند انخفاض مؤشر صحة صفقة مهمة كصفقة سارة ميلر بقيمة ثمانية وعشرين ألف دولار، يتيح النظام بضغطة زر واحدة تنشيط تصعيد الواتساب الفوري لإرسال تنبيه عاجل للإدارة لمنع انسحاب العميل.",
        url: "http://localhost:5173/smart-follow",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1000));
            try {
                const buttons = await page.$$('button');
                for (const btn of buttons) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text && (text.includes('تصعيد') || text.includes('Escalation') || text.includes('WhatsApp'))) {
                        await btn.click();
                        await new Promise(r => setTimeout(r, 1200));
                        break;
                    }
                }
            } catch(e) {}
        }
    },
    {
        id: 3,
        name: "Hybrid LLM API & Provider Test",
        arText: "يتميز النظام بدعم الربط الهجين مع عدة نماذج ذكاء اصطناعي مثل نموذج علاّم العربي على خوادم جروك، وجوجل جيميني، وأوبن راوتر. يمكنك اختبار وتغيير المزود مباشرة من الإعدادات.",
        url: "http://localhost:5173/settings",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1000));
            try {
                const testBtns = await page.$$('button');
                for (const btn of testBtns) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text && (text.includes('Test Connection') || text.includes('اختبار الاتصال'))) {
                        await btn.click();
                        await new Promise(r => setTimeout(r, 2000));
                        break;
                    }
                }
            } catch(e) {}
        }
    },
    {
        id: 4,
        name: "Automations Hub & Drip Sequences",
        arText: "من خلال مركز الأتمتة أوتوميشنز هب، تدار سلاسل التقطير التلقائية لمدة اربعة عشر يوماً لمتابعة العملاء، بالإضافة لأداة ملخص مكالمات العملاء بالذكاء الاصطناعي لرفع كفاءة المبيعات.",
        url: "http://localhost:5173/automations",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1200));
        }
    },
    {
        id: 5,
        name: "Projects & Kanban Board",
        arText: "يتيح قسم المشاريع للفرق متابعة سير الأعمال وتنظيم المهام عبر لوحات كانبان التفاعلية والتحكم في إنجاز المشاريع بسلاسة.",
        url: "http://localhost:5173/projects",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1200));
        }
    },
    {
        id: 6,
        name: "Team Sync & User Roles",
        arText: "في إدارة الفريق، يمكن للمدير إضافة أعضاء جدد وتعيين الأدوار والصلاحيات بدقة من مدير نظام كامل إلى مدير مبيعات ومسؤول مبيعات ومراقب.",
        url: "http://localhost:5173/users",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1200));
        }
    },
    {
        id: 7,
        name: "Branding Hub & Theme Customization",
        arText: "كما يتيح مركز العلامة التجارية براندينج هب تخصيص الشعار والألوان وأنظمة المظهر ليتناسب النظام تماماً مع الهوية البصرية للشركة.",
        url: "http://localhost:5173/branding",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1200));
        }
    },
    {
        id: 8,
        name: "Test Suite Pass & Conclusion",
        arText: "تم بفضل الله اجتياز جميع اختبارات الأتمتة الشاملة بنسبة مائة بالمائة. مشروع ليد فلو دوت أي آي يقدم المنظومة التكاملية لإدارة المبيعات بالذكاء الاصطناعي. شكراً لكم.",
        url: "http://localhost:5173/",
        action: async (page) => {
            await new Promise(r => setTimeout(r, 1200));
        }
    }
];

// Helper: Split long Arabic text into TTS chunks
function splitTextForTts(text, maxLen = 180) {
    const words = text.split(' ');
    const chunks = [];
    let current = '';

    for (const w of words) {
        if ((current + ' ' + w).length > maxLen) {
            chunks.push(current.trim());
            current = w;
        } else {
            current += (current ? ' ' : '') + w;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

// Fetch TTS MP3 chunk
async function fetchTtsChunk(text) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`TTS fetch failed: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

// Get Audio duration using FFmpeg / FFprobe
function getAudioDuration(filePath) {
    try {
        const out = execSync(`"${ffmpegPath}" -i "${filePath}" 2>&1`, { encoding: 'utf8' });
        const match = out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
        if (match) {
            const hours = parseFloat(match[1]);
            const minutes = parseFloat(match[2]);
            const seconds = parseFloat(match[3]);
            return hours * 3600 + minutes * 60 + seconds;
        }
    } catch(e) {
        const out = e.output ? e.output.join('') : e.message;
        const match = out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
        if (match) {
            const hours = parseFloat(match[1]);
            const minutes = parseFloat(match[2]);
            const seconds = parseFloat(match[3]);
            return hours * 3600 + minutes * 60 + seconds;
        }
    }
    return 6.0; // Fallback default duration
}

async function buildFullDemo() {
    console.log('🚀 Starting Full Arabic Audio-Synced Demo Video Construction...');

    // 1. GENERATE ARABIC AUDIO PER SCENE & MEASURE EXACT DURATION
    console.log('🎙️ Generating Arabic Voiceover Audio Chunks...');
    const sceneAudioFiles = [];
    const sceneDurations = [];

    for (const sc of scenes) {
        console.log(`🔊 Generating Audio for Scene ${sc.id}: ${sc.name}...`);
        const chunks = splitTextForTts(sc.arText);
        const chunkFiles = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunkBuf = await fetchTtsChunk(chunks[i]);
            const chunkPath = path.join(tempDir, `scene_${sc.id}_chunk_${i}.mp3`);
            fs.writeFileSync(chunkPath, chunkBuf);
            chunkFiles.push(chunkPath);
            await new Promise(r => setTimeout(r, 300));
        }

        // Concatenate chunks for this scene
        const sceneMp3 = path.join(tempDir, `scene_${sc.id}_full.mp3`);
        if (chunkFiles.length === 1) {
            fs.copyFileSync(chunkFiles[0], sceneMp3);
        } else {
            const listFile = path.join(tempDir, `scene_${sc.id}_list.txt`);
            const listContent = chunkFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
            fs.writeFileSync(listFile, listContent);
            execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${listFile}" -c copy "${sceneMp3}"`, { stdio: 'ignore' });
        }

        const duration = getAudioDuration(sceneMp3);
        sceneAudioFiles.push(sceneMp3);
        sceneDurations.push(duration);
        console.log(`✅ Scene ${sc.id} Audio Duration: ${duration.toFixed(2)} seconds`);
    }

    // 2. CAPTURE BROWSER SCREENSHOT FRAMES MATCHING EACH SCENE
    console.log('🎥 Launching Chrome for Automated Screen Walkthrough Capture...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--window-size=1920,1080', '--no-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();
    const sceneFramePaths = [];

    for (const sc of scenes) {
        console.log(`📸 Capturing Scene ${sc.id}: ${sc.name}...`);
        await page.goto(sc.url, { waitUntil: 'networkidle2' });
        if (sc.action) await sc.action(page);

        const framePath = path.join(tempDir, `frame_scene_${sc.id}.png`);
        await page.screenshot({ path: framePath, type: 'png' });
        sceneFramePaths.push(framePath);
    }

    await browser.close();

    // 3. CONCATENATE ALL AUDIO FILES INTO ONE FULL ARABIC VOICE TRACK
    console.log('🎵 Merging Scene Audio files into Full Arabic Narration...');
    const fullAudioList = path.join(tempDir, 'full_audio_list.txt');
    const fullAudioContent = sceneAudioFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(fullAudioList, fullAudioContent);

    const fullAudioPath = path.join(tempDir, 'arabic_full_narration.mp3');
    execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${fullAudioList}" -c copy "${fullAudioPath}"`, { stdio: 'ignore' });

    // 4. CREATE VIDEO CONCAT MANIFEST WITH EXACT DURATION MATCHING AUDIO
    console.log('🎞️ Building Video Concat Manifest Synced to Audio Durations...');
    const videoConcatList = path.join(tempDir, 'video_concat_list.txt');
    let videoConcatContent = '';

    for (let i = 0; i < scenes.length; i++) {
        const frameFile = sceneFramePaths[i].replace(/\\/g, '/');
        const dur = sceneDurations[i].toFixed(3);
        videoConcatContent += `file '${frameFile}'\nduration ${dur}\n`;
    }
    // Repeat last frame at the end
    videoConcatContent += `file '${sceneFramePaths[scenes.length - 1].replace(/\\/g, '/')}'\n`;
    fs.writeFileSync(videoConcatList, videoConcatContent);

    // 5. ENCODE VIDEO & MERGE AUDIO WITH 100% PERFECT SYNC
    console.log('🎬 Encoding Synced Full HD Video & Merging Audio Track...');
    const outputAppMp4 = path.join(appRootDir, 'leadflow_demo_arabic_full.mp4');
    const outputArtifactMp4 = path.join(artifactDir, 'leadflow_demo_arabic_full.mp4');

    const ffmpegCmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${videoConcatList}" -i "${fullAudioPath}" -vf "scale=1920:1080,format=yuv420p" -c:v libx264 -r 30 -pix_fmt yuv420p -c:a aac -shortest "${outputAppMp4}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    fs.copyFileSync(outputAppMp4, outputArtifactMp4);

    const totalVideoDuration = sceneDurations.reduce((a, b) => a + b, 0);

    console.log('\n====================================================');
    console.log('🎉 100% Synced Full Arabic Video Demo Rendered Successfully!');
    console.log(`⏱️ Total Video Duration: ${totalVideoDuration.toFixed(1)} seconds (${(totalVideoDuration / 60).toFixed(1)} minutes)`);
    console.log(`📁 Project Root MP4 File: ${outputAppMp4}`);
    console.log(`📁 Artifact MP4 File:     ${outputArtifactMp4}`);
    console.log('====================================================\n');
}

buildFullDemo();
