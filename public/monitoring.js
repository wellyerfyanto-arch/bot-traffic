// Monitoring page JavaScript
let currentSessionId = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    loadSessions();
    startAutoRefresh();
});

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        loadSessions();
        if (currentSessionId) {
            loadLogs(currentSessionId);
        }
    }, 3000);
}

async function loadSessions() {
    try {
        const response = await fetch('/api/all-sessions');
        const result = await response.json();
        
        if (result.success) {
            updateSessionsSummary(result.sessions);
            updateSessionsList(result.sessions);
            updateSessionSelector(result.sessions);
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

function updateSessionsSummary(sessions) {
    const summary = {
        total: sessions.length,
        running: sessions.filter(s => s.status === 'running').length,
        stopped: sessions.filter(s => s.status === 'stopped').length,
        error: sessions.filter(s => s.status === 'error').length
    };
    
    const summaryHTML = `
        <div class="summary-card">
            <h3>${summary.total}</h3>
            <p>Total Sessions</p>
        </div>
        <div class="summary-card" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
            <h3>${summary.running}</h3>
            <p>Running</p>
        </div>
        <div class="summary-card" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
            <h3>${summary.stopped}</h3>
            <p>Stopped</p>
        </div>
        <div class="summary-card" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
            <h3>${summary.error}</h3>
            <p>Errors</p>
        </div>
    `;
    
    document.getElementById('sessionsSummary').innerHTML = summaryHTML;
}

function updateSessionsList(sessions) {
    const container = document.getElementById('sessionsContainer');
    
    if (sessions.length === 0) {
        container.innerHTML = '<p>No active sessions. Go to configuration to start sessions.</p>';
        return;
    }
    
    const sessionsHTML = sessions.map(session => `
        <div class="session-item">
            <div class="session-header">
                <span class="session-id">${session.id}</span>
                <span class="session-status status-${session.status}">${session.status.toUpperCase()}</span>
            </div>
            <div class="session-details">
                <div class="session-detail">
                    <strong>Start Time:</strong> ${new Date(session.startTime).toLocaleString()}
                </div>
                <div class="session-detail">
                    <strong>Device Type:</strong> ${session.config.deviceType}
                </div>
                <div class="session-detail">
                    <strong>Profiles:</strong> ${session.config.profileCount}
                </div>
                <div class="session-detail">
                    <strong>Proxies:</strong> ${session.config.proxyList.length}
                </div>
            </div>
            <div class="session-actions">
                <button onclick="selectSession('${session.id}')">📋 View Logs</button>
                <button onclick="stopSession('${session.id}')">⏹️ Stop</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = sessionsHTML;
}

function updateSessionSelector(sessions) {
    const selector = document.getElementById('sessionSelector');
    const currentValue = selector.value;
    
    selector.innerHTML = '<option value="">Pilih session untuk melihat logs...</option>' +
        sessions.map(session => 
            `<option value="${session.id}" ${session.id === currentValue ? 'selected' : ''}>
                ${session.id} (${session.status})
            </option>`
        ).join('');
    
    if (currentSessionId && !sessions.find(s => s.id === currentSessionId)) {
        currentSessionId = null;
    }
}

async function selectSession(sessionId) {
    currentSessionId = sessionId;
    document.getElementById('sessionSelector').value = sessionId;
    await loadLogs(sessionId);
}

async function loadLogs(sessionId) {
    if (!sessionId) return;
    
    try {
        const response = await fetch(`/api/session-logs/${sessionId}`);
        const result = await response.json();
        
        if (result.success) {
            displayLogs(result.logs);
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function displayLogs(logs) {
    const container = document.getElementById('logContainer');
    
    if (logs.length === 0) {
        container.innerHTML = '<p>No logs available for this session.</p>';
        return;
    }
    
    const logsHTML = logs.map(log => {
        const logClass = log.step.includes('ERROR') ? 'log-error' : 
                        log.step.includes('WARNING') ? 'log-warning' :
                        log.step.includes('COMPLETE') ? 'log-success' : '';
        
        return `
            <div class="log-entry ${logClass}">
                <span class="log-timestamp">[${log.timestamp}]</span>
                <span class="log-step">${log.step}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = logsHTML;
    container.scrollTop = container.scrollHeight;
}

async function stopSession(sessionId) {
    try {
        const response = await fetch(`/api/stop-session/${sessionId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Session stopped successfully');
            loadSessions();
        }
    } catch (error) {
        alert('Error stopping session: ' + error.message);
    }
}

async function stopAllSessions() {
    if (!confirm('Are you sure you want to stop ALL sessions?')) return;
    
    try {
        const response = await fetch('/api/stop-all-sessions', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            alert('All sessions stopped');
            loadSessions();
        }
    } catch (error) {
        alert('Error stopping sessions: ' + error.message);
    }
}

async function clearAllSessions() {
    if (!confirm('Are you sure you want to clear ALL sessions and logs?')) return;
    
    try {
        const response = await fetch('/api/clear-sessions', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            alert('All sessions cleared');
            loadSessions();
            document.getElementById('logContainer').innerHTML = '<p>Logs cleared.</p>';
        }
    } catch (error) {
        alert('Error clearing sessions: ' + error.message);
    }
}

function refreshLogs() {
    if (currentSessionId) {
        loadLogs(currentSessionId);
    }
}

function clearLogs() {
    document.getElementById('logContainer').innerHTML = '<p>Logs cleared from view.</p>';
}

function goToConfig() {
    window.location.href = '/';
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
