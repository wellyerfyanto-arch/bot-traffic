class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    createSession(config) {
        const session = {
            id: this.generateSessionId(),
            config: config,
            status: 'running',
            logs: [],
            startTime: new Date(),
            currentStep: 0
        };
        
        this.sessions.set(session.id, session);
        return session;
    }

    stopSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.status = 'stopped';
            session.endTime = new Date();
        }
    }

    clearAllSessions() {
        this.sessions.clear();
    }
}
