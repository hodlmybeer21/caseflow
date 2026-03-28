const express = require('express');
const fs = require('fs');
const http = require('http');

fs.mkdirSync('/tmp/spa_static', {recursive: true});
fs.writeFileSync('/tmp/spa_static/index.html', '<h1>SPA</h1>');

const app = express();
app.use(express.static('/tmp/spa_static'));

// Catch-all: matches root + all paths
app.get('/{*path}', (req, res) => {
  res.sendFile('/tmp/spa_static/index.html');
});

const server = app.listen(3101, async () => {
  const paths = ['/', '/customers', '/nonexistent', '/api/test', '/main.js'];
  for (const p of paths) {
    const body = await new Promise(resolve => {
      http.get('http://localhost:3101' + p, res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve({s: res.statusCode, b: Buffer.concat(chunks).toString().slice(0, 30)}));
      });
    });
    console.log(p, '->', body.s, '|', body.b);
  }
  server.close();
  fs.rmSync('/tmp/spa_static', {recursive: true});
});
