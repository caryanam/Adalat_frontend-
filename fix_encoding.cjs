const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Users', 'Asus Vivobook', 'Desktop', 'Adalat', 'Adalat_frontend-', 'src', 'pages', 'auth', 'LawyerRegisterWizardPage.jsx');
let text = fs.readFileSync(file, 'utf8');

// The original file was mangled by Windows-1252 reading a UTF-8 file
text = text.replace(/âš ï¸ /g, '⚠️ ');
text = text.replace(/âœ“/g, '✓');
text = text.replace(/â€“/g, '-');
text = text.replace(/â‚¹/g, '₹');
text = text.replace(/ðŸ’¬/g, '💬');

// What PowerShell read instead of the correct Windows-1252 characters
text = text.replace(/s\?/g, '⚠️');
text = text.replace(/o\"/g, '✓');
text = text.replace(/\?\"/g, '-');
text = text.replace(/\'/g, '₹');
text = text.replace(/ǽ\?s/g, '₹');
text = text.replace(/Ys\?/g, '💬');
text = text.replace(/Ϧ/g, '₹');

fs.writeFileSync(file, text, 'utf8');
console.log('Done fixing encoding!');
