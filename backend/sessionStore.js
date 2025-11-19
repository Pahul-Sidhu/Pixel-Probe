// backend/sessionStore.js
const sessions = new Map();

// helper to get or create a session
function getSession(sessionId) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            dom: null,
            styles: null,
            screenshot: null,
            createdAt: Date.now()
        });
    }
    return sessions.get(sessionId);
}

module.exports = { sessions, getSession };