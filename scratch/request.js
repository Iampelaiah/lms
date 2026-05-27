const http = require('http');

http.get('http://localhost:9003/classroom/test-class?role=tutor&name=Dr%20Max', (res) => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('BODY LENGTH:', data.length);
  });
}).on('error', (err) => {
  console.error('ERROR:', err);
});
