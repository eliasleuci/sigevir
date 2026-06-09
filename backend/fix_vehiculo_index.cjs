const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'src/models/index.js');
let content = fs.readFileSync(indexPath, 'utf8');

// Remove import
content = content.replace(/import Vehiculo from '\.\/Vehiculo\.js';\r?\n/, '');

// Remove association lines
content = content.replace(/\/\/ 4\. Vehiculo <-> Retencion \(1:N\)\r?\n/, '');
content = content.replace(/\/\/ Un veh.*?a lo largo del tiempo\r?\n/, '');
content = content.replace(/Vehiculo\.hasMany\(Retencion.*?;\r?\n/, '');
content = content.replace(/Retencion\.belongsTo\(Vehiculo.*?;\r?\n/, '');

// Remove Vehiculo from db export
content = content.replace(/,\s*Vehiculo\s*,/, ',\n');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Removed Vehiculo references from index.js');
