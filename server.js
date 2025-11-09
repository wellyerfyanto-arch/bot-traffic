const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'github-traffic-bot-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Import bot modules
const TrafficGenerator = require('./bot/trafficGenerator');
const botManager = new TrafficGenerator();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/monitoring', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'monitoring.html'));
});

// API Routes
app.post('/api/start-session', async (req, res) => {
    try {
        const { profiles, proxies, targetUrl, deviceType } = req.body;
        
        const sessionConfig = {
            profileCount: parseInt(profiles) || 1,
            proxyList: proxies ? proxies.split('\n').filter(p => p.trim()) : [],
            targetUrl: targetUrl,
            deviceType: deviceType || 'desktop'
        };

        const sessionId = await botManager.startNewSession(sessionConfig);
        
        res.json({ 
            success: true, 
            sessionId,
            message: 'Session started successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/session-logs/:sessionId', (req, res) => {
    try {
        const logs = botManager.getSessionLogs(req.params.sessionId);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/all-sessions', (req, res) => {
    try {
        const sessions = botManager.getAllSessions();
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/stop-session/:sessionId', (req, res) => {
    try {
        botManager.stopSession(req.params.sessionId);
        res.json({ success: true, message: 'Session stopped' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/stop-all-sessions', (req, res) => {
    try {
        botManager.stopAllSessions();
        res.json({ success: true, message: 'All sessions stopped' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/clear-sessions', (req, res) => {
    try {
        botManager.clearAllSessions();
        res.json({ success: true, message: 'All sessions cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test endpoint
app.get('/api/test-puppeteer', async (req, res) => {
    try {
        const result = await botManager.testPuppeteer();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🖥️  Puppeteer executable: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
});
