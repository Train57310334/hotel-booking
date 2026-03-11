const fs = require('fs');
const path = require('path');

const emojiRegex = /\p{Emoji_Presentation}/gu;
const targetDir = 'C:\\Users\\ASUS\\workspace\\hotel-booking\\hotel-booking-frontend';

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
                scanDir(fullPath);
            }
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (emojiRegex.test(line)) {
                    console.log(`[${index + 1}] ${fullPath}: ${line.trim()}`);
                }
            });
        }
    }
}

console.log('Scanning for emojis...');
scanDir(targetDir);
console.log('Done.');
