const groqService = require('../services/groqService');
const { TRIP_CHAT_SYSTEM_PROMPT } = require('../prompts/tripChatSystemPrompt');
const { validateTripDraft } = require('../utils/validateTripDraft');

const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const OPENING_MESSAGE = 'שלום, אני רוצה לתכנן טיול חדש. תתחיל/י בברכה קצרה ובשאלה הראשונה.';
const AI_UNAVAILABLE_MESSAGE = 'עוזר ה-AI אינו זמין כרגע. אפשר ליצור את הטיול באופן ידני בעזרת הכפתור "+ טיול חדש".';

function chatErrorMessage(err, fallback) {
    return err && err.aiUnavailable ? AI_UNAVAILABLE_MESSAGE : fallback;
}

function createSession(userId) {
    return {
        userId: userId,
        history: [{ role: 'system', content: TRIP_CHAT_SYSTEM_PROMPT }],
        draft: null,
        status: 'collecting',
        createdAt: new Date(),
        lastActivity: new Date()
    };
}

// runs one AI turn against the session's history, updates session state in place,
// and returns what the caller should emit - it does not emit anything itself,
// so callers control the typing-indicator/bot-message/draft-ready event ordering.
async function advanceConversation(session) {
    const aiResponse = await groqService.getNextAiResponse(session.history, session.draft);
    session.history.push({ role: 'assistant', content: JSON.stringify(aiResponse) });
    session.draft = aiResponse.draft;
    session.lastActivity = new Date();

    let readyDraft = null;
    if (aiResponse.status === 'ready') {
        const validation = await validateTripDraft(session.draft);
        if (validation.valid) {
            readyDraft = Object.assign({}, session.draft, { interests: validation.cleanInterests });
            session.status = 'ready';
        } else {
            session.status = 'collecting';
        }
    } else {
        session.status = 'collecting';
    }

    return { reply: aiResponse.reply, draft: session.draft, readyDraft: readyDraft };
}

function registerAiTripSocket(io) {
    const sessions = new Map();

    // attach userId when provided — do not block connections without it (forum uses the same io instance)
    io.use(function(socket, next) {
        const userId = Number(socket.handshake.auth && socket.handshake.auth.userId);
        if (Number.isInteger(userId) && userId > 0) {
            socket.userId = userId;
        }
        next();
    });

    const sweepInterval = setInterval(function() {
        const now = Date.now();
        sessions.forEach(function(session, socketId) {
            if (now - session.lastActivity.getTime() > SESSION_IDLE_TIMEOUT_MS) {
                const idleSocket = io.sockets.sockets.get(socketId);
                if (idleSocket) idleSocket.disconnect(true);
                sessions.delete(socketId);
            }
        });
    }, SWEEP_INTERVAL_MS);

    io.on('connection', function(socket) {
        async function startSession() {
            if (!socket.userId) {
                socket.emit('ai-trip:error', { message: 'יש להתחבר כדי להשתמש בעוזר ה-AI.' });
                return;
            }
            const session = createSession(socket.userId);
            sessions.set(socket.id, session);
            session.history.push({ role: 'user', content: OPENING_MESSAGE });

            try {
                const result = await advanceConversation(session);
                socket.emit('ai-trip:bot-message', { text: result.reply, draft: result.draft });
                if (result.readyDraft) {
                    socket.emit('ai-trip:draft-ready', { draft: result.readyDraft });
                }
            } catch (err) {
                socket.emit('ai-trip:error', {
                    message: chatErrorMessage(err, 'משהו השתבש בפתיחת השיחה עם ה-AI. נסה/י שוב.')
                });
            }
        }

        socket.on('ai-trip:start', function() {
            startSession();
        });

        socket.on('ai-trip:user-message', async function(payload) {
            const session = sessions.get(socket.id);
            if (!session) return;

            const text = payload && typeof payload.text === 'string' ? payload.text.trim() : '';
            if (!text) return;

            session.history.push({ role: 'user', content: text });
            session.lastActivity = new Date();
            socket.emit('ai-trip:bot-typing', { typing: true });

            try {
                const result = await advanceConversation(session);
                socket.emit('ai-trip:bot-typing', { typing: false });
                socket.emit('ai-trip:bot-message', { text: result.reply, draft: result.draft });
                if (result.readyDraft) {
                    socket.emit('ai-trip:draft-ready', { draft: result.readyDraft });
                }
            } catch (err) {
                socket.emit('ai-trip:bot-typing', { typing: false });
                socket.emit('ai-trip:error', {
                    message: chatErrorMessage(err, 'משהו השתבש בשיחה עם ה-AI. נסה/י שוב.')
                });
            }
        });

        socket.on('ai-trip:reset', function() {
            sessions.delete(socket.id);
            startSession();
        });

        socket.on('disconnect', function() {
            sessions.delete(socket.id);
        });
    });

    return function stopSweep() {
        clearInterval(sweepInterval);
    };
}

module.exports = { registerAiTripSocket };
