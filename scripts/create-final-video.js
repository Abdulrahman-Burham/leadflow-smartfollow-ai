const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

async function createFinalVideo() {
    const artifactDir = 'C:\\Users\\abdul\\.gemini\\antigravity\\brain\\3437be1a-e9fc-4ce1-9eb1-8b4769709f64';
    const appRootDir = 'D:\\learn\\micro mind\\YourApp';
    
    const audioWav = path.join(appRootDir, 'leadflow_voiceover.wav');
    const inputMp4 = path.join(appRootDir, 'leadflow_demo.mp4');
    const finalMp4 = path.join(appRootDir, 'leadflow_demo_with_audio.mp4');
    const artifactFinalMp4 = path.join(artifactDir, 'leadflow_demo_with_audio.mp4');

    console.log('🎙️ Generating Voiceover Audio File...');
    const textToSpeak = "Welcome to LeadFlow AI WhatsApp Pro CRM demo. Here is the sales dashboard with active pipeline analytics and deal health scores. Next, in SmartFollow AI, we trigger one click WhatsApp escalation for high value leads at risk. In Settings, we connect live LLM models including Groq Allam Arabic AI and Google Gemini. Finally, in Automations Hub, we manage 14 day automated drip sequences.";

    const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("${audioWav.replace(/\\/g, '/')}")
$synth.Speak("${textToSpeak}")
$synth.Dispose()
`;

    const psPath = path.join(appRootDir, 'scripts', 'gen_audio.ps1');
    fs.writeFileSync(psPath, psScript);

    try {
        execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit' });
    } catch(e) {
        console.warn('Audio generation warning:', e.message);
    }

    console.log('🎬 Merging Video and Audio with FFmpeg...');
    const cmd = `"${ffmpegPath}" -y -i "${inputMp4}" -i "${audioWav}" -c:v copy -c:a aac -shortest "${finalMp4}"`;
    execSync(cmd, { stdio: 'inherit' });

    fs.copyFileSync(finalMp4, artifactFinalMp4);
    console.log('✅ Final MP4 Video with Audio Created Successfully!');
    console.log('📁 Project Root Video File:', finalMp4);
    console.log('📁 Artifact Video File:', artifactFinalMp4);
}

createFinalVideo();
