const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const safePath = path.normalize(pathname).replace(/^([.][.][\\/])+/, '');
  const file = path.join(root, safePath);
  if (file !== path.join(root, 'tests', 'mock-application.html')) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  fs.createReadStream(file).pipe(response);
}).listen(8765, '127.0.0.1', () => console.log('Mock application at http://127.0.0.1:8765/tests/mock-application.html'));
