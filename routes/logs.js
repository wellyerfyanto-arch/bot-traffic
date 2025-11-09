const express = require('express');
const router = express.Router();

router.get('/logs/stream/:sessionId', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const sessionId = req.params.sessionId;
    const sendLog = setInterval(() => {
        const logs = botManager.getSessionLogs(sessionId);
        res.write(`data: ${JSON.stringify(logs)}\n\n`);
    }, 1000);

    req.on('close', () => {
        clearInterval(sendLog);
    });
});
