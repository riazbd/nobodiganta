const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./resources/js/features/admin');

files.forEach(file => {
  if (!file.endsWith('.jsx') && !file.endsWith('.js')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('[]={')) {
      content = content.replace(/\[\]=\{/g, 'data={');
      changed = true;
  }
  
  if (content.includes("onNavigate?.('[]')")) {
      content = content.replace(/onNavigate\?\.\('\[\]'\)/g, "onNavigate?.('dashboard')");
      changed = true;
  }
  
  if (content.includes("onNavigate?.([])")) {
      content = content.replace(/onNavigate\?\.\(\[\]\)/g, "onNavigate?.('dashboard')");
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed JSX in:', file);
  }
});
