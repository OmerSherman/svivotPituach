const Groq = require('groq-sdk');

if (!process.env.GROQ_API_KEY) {
    console.warn('[groqService] GROQ_API_KEY is not set - AI trip chat will fail.');
}

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// create the client lazily so a missing key doesn't crash the server on startup
var _groq = null;
function getGroq() {
    if (!_groq) {
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
}

const EMPTY_DRAFT = {
    name: null,
    countryId: null,
    startMonth: null,
    endMonth: null,
    travelStyle: null,
    budget: null,
    interests: []
};

async function callGroq(messages) {
    const completion = await getGroq().chat.completions.create({
        model: MODEL,
        messages: messages,
        response_format: { type: 'json_object' }
    });
    return completion.choices[0].message.content;
}

function fallbackResponse(previousDraft) {
    return {
        reply: 'מצטער, לא הבנתי. אפשר לנסח אחרת?',
        status: 'collecting',
        draft: previousDraft || EMPTY_DRAFT
    };
}

// thrown when Groq itself is unreachable (missing/invalid key, network, rate-limit) -
// as opposed to a malformed-JSON response, which is retried/falls back instead.
// logs the real reason server-side (status/message only - never the API key) so an
// "AI unavailable" report is diagnosable without guesswork.
function aiUnavailableError(originalErr) {
    console.error('[groqService] Groq call failed - treating AI as unavailable:', {
        status: originalErr && originalErr.status,
        code: originalErr && originalErr.error && originalErr.error.error && originalErr.error.error.code,
        message: originalErr && originalErr.message
    });
    const err = new Error('AI assistant is unavailable');
    err.aiUnavailable = true;
    return err;
}

// conversationHistory: array of {role: "system"|"user"|"assistant", content: string}
async function getNextAiResponse(conversationHistory, previousDraft) {
    try {
        const raw = await callGroq(conversationHistory);
        return JSON.parse(raw);
    } catch (firstErr) {
        if (!(firstErr instanceof SyntaxError)) throw aiUnavailableError(firstErr);

        try {
            const repairMessages = conversationHistory.concat([
                { role: 'user', content: 'ההודעה הקודמת לא הייתה JSON תקין. החזר רק JSON תקין במבנה שצוין, בלי טקסט נוסף ובלי גדרות markdown.' }
            ]);
            const raw = await callGroq(repairMessages);
            return JSON.parse(raw);
        } catch (secondErr) {
            if (!(secondErr instanceof SyntaxError)) throw aiUnavailableError(secondErr);
            return fallbackResponse(previousDraft);
        }
    }
}

module.exports = { getNextAiResponse, EMPTY_DRAFT };
