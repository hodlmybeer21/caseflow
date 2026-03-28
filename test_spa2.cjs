const express = require('express');
const path = require('path');
const fs = require('fs');

const STATIC_PATH = path.join(process.cwd(), 'packages/client/dist/public');
const indexFile = path.join(STATIC_PATH, 'index.html');

console.log('Static path:', STATIC_PATH);
console.log('Index file:', indexFile);
console.log('Index exists:', fs.existsSync(indexFile));

const app = express();

// SPA fallback
app.get('/{*path}', (req, res) => {
  console.log('catchall called for:', req.path);
  res.sendFile(indexFile, (err) => {
    if (err) console.error('sendFile error:', err.message);
  });
});

app.listen(3021, () => console.log('Listening'));
