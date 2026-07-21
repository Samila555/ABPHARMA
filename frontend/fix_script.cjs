const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/HP/Desktop/AbPharma/frontend/src');
let countFixed = 0;
let countCurrency = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix ETB corruption
    if (content.split('ETB ').length > 20) {
        content = content.split('ETB ').join('');
        countFixed++;
    }

    // In rare case a file didn't get corrupted but needs replacement
    if (content.includes('₦')) {
        content = content.replace(/₦/g, 'ETB ');
        countCurrency++;
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
}
console.log(`Fixed ${countFixed} corrupted files. Transformed currency in ${countCurrency} files.`);
