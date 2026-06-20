import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3000";

let socket = null;

// reads the logged-in userId the same way api.js's buildAuthHeaders does
function getUserId() {
    const stored = localStorage.getItem("user");
    if (!stored) {
        return null;
    }

    try {
        const user = JSON.parse(stored);
        return user.userId;
    } catch (err) {
        return null;
    }
}

function connect() {
    socket = io(SOCKET_URL, { auth: { userId: getUserId() } });
    return socket;
}

function startChat() {
    socket.emit("ai-trip:start");
}

function sendMessage(text) {
    socket.emit("ai-trip:user-message", { text: text });
}

function resetChat() {
    socket.emit("ai-trip:reset");
}

function onBotMessage(cb) {
    socket.on("ai-trip:bot-message", cb);
}

function onBotTyping(cb) {
    socket.on("ai-trip:bot-typing", cb);
}

function onDraftReady(cb) {
    socket.on("ai-trip:draft-ready", cb);
}

function onError(cb) {
    socket.on("ai-trip:error", cb);
}

function onConnectError(cb) {
    socket.on("connect_error", cb);
}

function disconnect() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

const aiTripSocketService = {
    connect,
    startChat,
    sendMessage,
    resetChat,
    onBotMessage,
    onBotTyping,
    onDraftReady,
    onError,
    onConnectError,
    disconnect
};

export default aiTripSocketService;
