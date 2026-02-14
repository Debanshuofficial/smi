const express = require('./server/node_modules/express');
const path = require('path');
const app = express();
const port = 5500;

app.use(express.static(path.join(__dirname, '/'), {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));

app.listen(port, () => {
    console.log(`Frontend running on http://localhost:${port}`);
});
