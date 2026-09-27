const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function renderMp4() {
    const artifactDir = 'C:\\Users\\abdul\\.gemini\\antigravity\\brain\\3437be1a-e9fc-4ce1-9eb1-8b4769709f64';
    const framesDir = path.join(artifactDir, 'demo_recorded_frames');
    const appRootDir = 'D:\\learn\\micro mind\\YourApp';
    const outputMp4 = path.join(appRootDir, 'leadflow_demo.mp4');
    const artifactMp4 = path.join(artifactDir, 'leadflow_demo.mp4');

    console.log('🎥 Rendering high-definition MP4 Video file...');

    const concatFile = path.join(framesDir, 'concat.txt');
    const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();

    let concatContent = '';
    frameFiles.forEach(f => {
        const fullPath = path.join(framesDir, f).replace(/\\/g, '/');
        concatContent += `file '${fullPath}'\nduration 4.5\n`;
    });
    if (frameFiles.length > 0) {
        const lastFile = path.join(framesDir, frameFiles[frameFiles.length - 1]).replace(/\\/g, '/');
        concatContent += `file '${lastFile}'\n`;
    }

    fs.writeFileSync(concatFile, concatContent);

    const cmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${concatFile}" -vf "scale=1920:1080,format=yuv420p" -c:v libx264 -r 30 -pix_fmt yuv420p "${outputMp4}"`;
    console.log('Running FFmpeg encoding command...');
    execSync(cmd, { stdio: 'inherit' });

    fs.copyFileSync(outputMp4, artifactMp4);
    console.log('✅ MP4 Video file rendered successfully!');
    console.log('📁 Application Root Video:', outputMp4);
    console.log('📁 Artifact Video:', artifactMp4);
}

renderMp4();
