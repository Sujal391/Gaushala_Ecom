const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://api.untappednature.com/api/products/27';

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.success && parsed.data) {
        const p = parsed.data;
        const out = [];
        out.push(`ID: ${p.id}`);
        out.push(`Name: ${p.name}`);
        out.push(`Name Length: ${p.name.length}`);
        out.push(`Desc Length: ${p.description ? p.description.length : 0}`);
        out.push(`Sizes: ${JSON.stringify(p.sizes)}`);
        
        fs.writeFileSync(path.join(__dirname, 'output.txt'), out.join('\n'));
        console.log('Successfully wrote diagnostic data to output.txt');
      } else {
        fs.writeFileSync(path.join(__dirname, 'output.txt'), 'Error: ' + JSON.stringify(parsed));
      }
    } catch (e) {
      fs.writeFileSync(path.join(__dirname, 'output.txt'), 'JSON Parse Error: ' + e.message);
    }
  });
});
