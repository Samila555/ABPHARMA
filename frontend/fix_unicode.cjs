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

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace the corrupted Naira sign  (3 bytes E2 82 A6) -> "ETB "
    content = content.replace(/\uFFFD\uFFFD\uFFFD/g, 'ETB ');

    // Replace the corrupted shopping cart  (4 bytes F0 9F 9B 92) -> "🛒"
    content = content.replace(/\uFFFD\uFFFD\uFFFD\uFFFD/g, '🛒');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
}
console.log("Done fixing corrupted Unicode and updating to ETB.");
