const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (!filepath.includes('node_modules') && !filepath.includes('.git') && !filepath.includes('.next')) {
                filelist = walkSync(filepath, filelist);
            }
        } else {
            if (filepath.endsWith('.js') || filepath.endsWith('.jsx') || filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
                filelist.push(filepath);
            }
        }
    });
    return filelist;
};

const frontendPath = 'c:\\Users\\ASUS\\workspace\\hotel-booking\\hotel-booking-frontend';
const files = walkSync(frontendPath);

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    // Replace typical flat button blues with glow variants
    // Examples: bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-glow-blue hover:shadow-glow-blue-lg
    
    // Convert generic blue buttons with standard shadow -> glow shadow
    newContent = newContent.replace(/shadow-lg shadow-blue-[0-9]{3}\/[0-9]{2}/g, 'shadow-glow-blue hover:shadow-glow-blue-lg');
    newContent = newContent.replace(/shadow-md shadow-blue-[0-9]{3}\/[0-9]{2}/g, 'shadow-glow-blue hover:shadow-glow-blue-lg');
    newContent = newContent.replace(/shadow-xl shadow-blue-[0-9]{3}\/[0-9]{2}/g, 'shadow-glow-blue-lg hover:shadow-[0_0_24px_rgba(59,130,246,0.8)]');

    // Make sure we don't have duplicated hover:shadow
    newContent = newContent.replace(/shadow-glow-blue hover:shadow-glow-blue-lg');
    
    // Replace active tab generic styles
    // Ex: text-blue-500 border-b-2 border-blue-500 shadow-glow-border -> text-blue-500 border-b-2 border-blue-500 shadow-glow-border
    newContent = newContent.replace(/border-blue-500 shadow-glow-border(.*?)text-blue-500/g, 'border-blue-500 shadow-glow-border$1text-blue-500');
    newContent = newContent.replace(/text-blue-500(.*?)border-blue-500 shadow-glow-border/g, 'text-blue-500$1border-blue-500 shadow-glow-border');
    
    // Common background blues
    // bg-blue-600 hover:bg-blue-500 shadow-glow-blue hover:shadow-glow-blue-lg -> bg-blue-600 hover:bg-blue-500 + shadow-glow-blue
    // Since we don't know the exact order in className strings, we can just replace the specific color utility
    newContent = newContent.replace(/bg-blue-600 hover:bg-blue-500 shadow-glow-blue hover:shadow-glow-blue-lg');
    newContent = newContent.replace(/bg-blue-600 hover:bg-blue-500 shadow-glow-blue hover:shadow-glow-blue-lg');

    // Clean up possible duplicated classes 
    newContent = newContent.replace(/shadow-glow-blue hover:shadow-glow-blue-lg/g, 'shadow-glow-blue hover:shadow-glow-blue-lg');

    // Use .active-tab when possible? It's harder with React dynamic classes, so inline utility replacement above is better.
    // Use .active-row? We could replace generic active rows but we don't know the exact class structure of each. 
    // They usually look like `bg-blue-50 border-l-4 border-blue-600` or similar. Let's see if we find any.
    newContent = newContent.replace(/active-row/g, 'active-row');
    newContent = newContent.replace(/active-row/g, 'active-row');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        modifiedCount++;
    }
});

console.log(`Replaced button classes in ${modifiedCount} files.`);
