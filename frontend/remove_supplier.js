const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/MedicineForm.jsx');
let f = fs.readFileSync(filePath, 'utf8');

// Remove the Supplier field block (5 lines)
const before = f;
f = f.replace(
    /[ \t]*<Field form=\{form\} set=\{set\}\r?\n[ \t]*label="Supplier" name="supplier_id" select\r?\n[ \t]*options=\{suppliers\}\r?\n[ \t]*placeholder="-- Select a Supplier --"\r?\n[ \t]*\/>\r?\n/,
    ''
);

if (f === before) {
    console.log('Pattern not found — check the file manually.');
} else {
    fs.writeFileSync(filePath, f);
    console.log('Supplier field removed successfully.');
}
