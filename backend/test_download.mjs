import fs from 'fs';
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 4002,
  path: '/api/depositos/f7a2a6fd-747c-4fcb-8f5f-a2b715ffd14d/constancia-entrega',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + process.argv[2]
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  const file = fs.createWriteStream('test_pdf.pdf');
  res.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log('Download complete');
    });
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
