const https = require('https');

const url = 'https://api.untappednature.com/api/products';

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Success:', parsed.success);
      if (parsed.success && Array.isArray(parsed.data)) {
        console.log('Total products:', parsed.data.length);
        parsed.data.forEach(p => {
          console.log(`ID: ${p.id} | Name: ${p.name.substring(0, 40)}... | Desc Length: ${p.description ? p.description.length : 0} | Sizes Count: ${p.sizes ? p.sizes.length : 0}`);
          if (p.sizes) {
            console.log('Sizes:', JSON.stringify(p.sizes));
          }
        });
      } else {
        console.log('Response:', parsed);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data preview:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
