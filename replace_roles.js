const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

walkDir('.', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.md') || filePath.endsWith('.sql')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = content.replace(/admin/g, 'admin');
    content = content.replace(/agente_campo/g, 'agente_campo');
    content = content.replace(/fiscal_juez/g, 'fiscal_juez');
    
    // carefully replace DEPOSITO when it refers to a role
    content = content.replace(/'deposito'/g, "'deposito'");
    content = content.replace(/"deposito"/g, '"deposito"');
    content = content.replace(/rol:\s*'deposito'/g, "rol: 'deposito'");
    content = content.replace(/role:\s*'deposito'/g, "role: 'deposito'");
    content = content.replace(/\[\s*'admin',\s*'ADMIN_INSTITUCION',\s*'deposito'\s*\]/g, "['admin', 'ADMIN_INSTITUCION', 'deposito']");
    
    // other typos
    content = content.replace(/"agente_campo"/g, '"agente_campo"');
    content = content.replace(/"fiscal_juez"/g, '"fiscal_juez"');
    content = content.replace(/"admin"/g, '"admin"');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
