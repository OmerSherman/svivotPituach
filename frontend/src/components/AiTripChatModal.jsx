import { useEffect, useRef, useState } from "react";
import aiTripSocketService from "../services/aiTripSocketService";
import TripForm from "./TripForm";
import "./AiTripChatModal.css";

// props: onConfirm, onCancel
function AiTripChatModal({ onConfirm, onCancel }) {
    const [phase, setPhase] = useState("chat"); // "chat" | "review"
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState(null);
    const [typing, setTyping] = useState(false);
    const [inputText, setInputText] = useState("");
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(function() {
        aiTripSocketService.connect();

        aiTripSocketService.onBotMessage(function(msg) {
            setMessages(function(prev) {
                return prev.concat([{ role: "bot", text: msg.text }]);
            });
        });

        aiTripSocketService.onBotTyping(function(payload) {
            setTyping(payload.typing);
        });

        aiTripSocketService.onDraftReady(function(payload) {
            setDraft(payload.draft);
        });

        aiTripSocketService.onError(function(payload) {
            setError((payload && payload.message) || "משהו השתבש בצ'אט. נסה/י שוב.");
        });

        aiTripSocketService.onConnectError(function() {
            setError("לא הצלחנו להתחבר לצ'אט ה-AI. נסה/י שוב מאוחר יותר.");
        });

        aiTripSocketService.startChat();

        return function() {
            aiTripSocketService.disconnect();
        };
    }, []);

    useEffect(function() {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typing]);

    function handleSend() {
        var text = inputText.trim();
        if (!text) return;

        setMessages(function(prev) {
            return prev.concat([{ role: "user", text: text }]);
        });
        aiTripSocketService.sendMessage(text);
        setInputText("");
    }

    function handleInputKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    }

    function handleReset() {
        setMessages([]);
        setDraft(null);
        setError("");
        setTyping(false);
        aiTripSocketService.resetChat();
    }

    function handleOverlayClick(e) {
        if (e.target.classList.contains("atc-overlay")) {
            onCancel();
        }
    }

    function backToChat() {
        setPhase("chat");
    }

    function goToReview() {
        setPhase("review");
    }

    async function handleConfirmAndClose(formData) {
        await onConfirm(formData);
        onCancel();
    }

    if (phase === "review" && draft) {
        return (
            <TripForm
                initialData={draft}
                onSave={handleConfirmAndClose}
                onCancel={backToChat}
            />
        );
    }

    return (
        <div className="atc-overlay" onClick={handleOverlayClick}>
            <div className="atc-modal">
                <div className="atc-header">
                    <h2>✨ תכנון טיול עם AI</h2>
                    <div className="atc-header-actions">
                        <button className="atc-reset-link" onClick={handleReset}>התחל מחדש</button>
                        <button className="atc-close" onClick={onCancel}>✕</button>
                    </div>
                </div>

                <div className="atc-messages">
                    {messages.map(function(msg, i) {
                        return (
                            <div
                                key={i}
                                className={"atc-bubble " + (msg.role === "user" ? "atc-bubble-user" : "atc-bubble-bot")}
                            >
                                {msg.text}
                            </div>
                        );
                    })}

                    {typing && (
                        <div className="atc-typing">
                            <span className="atc-typing-dot"></span>
                            <span className="atc-typing-dot"></span>
                            <span className="atc-typing-dot"></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {draft && (
                    <div className="atc-draft-cta">
                        <button className="atc-draft-cta-btn" onClick={goToReview}>
                            מעבר לאישור הטיול
                        </button>
                    </div>
                )}

                {error && <p className="atc-error">{error}</p>}

                <div className="atc-input-row">
                    <input
                        type="text"
                        value={inputText}
                        placeholder="כתוב/י כאן..."
                        onChange={function(e) { setInputText(e.target.value); }}
                        onKeyDown={handleInputKeyDown}
                    />
                    <button className="atc-send-btn" onClick={handleSend} disabled={!inputText.trim()}>
                        שלח
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AiTripChatModal;
