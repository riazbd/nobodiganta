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
  if (content.includes('mockData')) {
    // Remove import
    content = content.replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+mockData['"];?\r?\n?/g, '');
    
    // Replace mock variables with empty arrays/objects safely
    content = content.replace(/\bcomments\b(?!:)/g, '[]'); // Only replace standalone word
    
    // For others, let's just make them empty arrays if they are used
    const mocks = ['subscribers', 'reporters', 'pitches', 'articles', 'activities', 'trafficData', 'trafficSources', 'todos', 'adSlots', 'mediaItems', 'notifications'];
    
    mocks.forEach(mock => {
      const regex = new RegExp(`\\b${mock}\\b`, 'g');
      content = content.replace(regex, '[]');
    });
    
    content = content.replace(/\brevenueData\b/g, '{ labels: [], datasets: [] }');
    
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});

if (fs.existsSync('./resources/js/features/admin/api/mockData.js')) {
    fs.unlinkSync('./resources/js/features/admin/api/mockData.js');
    console.log('Deleted mockData.js');
}
