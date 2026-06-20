import { useState, useEffect, useRef, useContext } from 'react';
import socket from '../services/socket';
import userContext from '../contexts/userContext';

function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2);
}

function formatMessageDate(date) {
    var d = new Date(date);
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'היום';
    if (d.toDateString() === yesterday.toDateString()) return 'אתמול';
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });
}

function ForumChat({ room, roomName, onClose }) {
    var [messages, setMessages] = useState([]);
    var [onlineCount, setOnlineCount] = useState(0);
    var [inputText, setInputText] = useState('');
    var [connected, setConnected] = useState(socket.connected);
    var [sendError, setSendError] = useState('');
    var messagesContainerRef = useRef(null);
    var { user } = useContext(userContext);

    var userId = user ? user.userId : 0;
    var userName = user ? user.firstName : 'אורח';

    // scroll only inside the chat panel — never the whole page
    useEffect(function() {
        var el = messagesContainerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    useEffect(function() {
        setSendError('');

        fetch('http://localhost:3000/api/forum/' + room + '/messages')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) setMessages(data.data);
            })
            .catch(function(err) {
                console.error('Could not load chat history', err);
            });

        socket.emit('room:join', { room: room });

        function handleNewMessage(msg) {
            if (msg.room === room) {
                setMessages(function(prev) { return [...prev, msg]; });
            }
        }

        function handlePresence(data) {
            if (data.room === room) setOnlineCount(data.count);
        }

        function handleConnect() { setConnected(true); }
        function handleDisconnect() { setConnected(false); }

        function handleMessageError(data) {
            setSendError(data.message || 'שליחת ההודעה נכשלה');
            setTimeout(function() { setSendError(''); }, 4000);
        }

        socket.on('message:new', handleNewMessage);
        socket.on('presence:update', handlePresence);
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('message:error', handleMessageError);

        return function() {
            socket.off('message:new', handleNewMessage);
            socket.off('presence:update', handlePresence);
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('message:error', handleMessageError);
        };
    }, [room]);

    function handleSend() {
        if (!inputText.trim() || !connected) return;

        var text = inputText.trim();

        var optimistic = {
            id: 'pending_' + Date.now(),
            room: room,
            userId: userId,
            userName: userName,
            text: text,
            createdAt: new Date()
        };
        setMessages(function(prev) { return [...prev, optimistic]; });

        socket.emit('message:send', {
            room: room,
            userId: userId,
            userName: userName,
            text: text
        });

        setInputText('');
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    var lastDateLabel = null;

    return (
        <div className="forum-chat">
            <div className="forum-chat-header">
                <div className="forum-chat-header-info">
                    <h3 className="forum-chat-title">{roomName}</h3>
                    <span className={'forum-connection' + (connected ? ' forum-connection--on' : '')}>
                        <span className="forum-connection-dot" />
                        {connected ? 'מחובר' : 'מנותק'}
                    </span>
                </div>
                <div className="forum-chat-header-actions">
                    <span className="forum-online-badge">
                        <span className="forum-online-dot" />
                        {onlineCount} מחוברים
                    </span>
                    {onClose && (
                        <button
                            type="button"
                            className="forum-chat-close"
                            onClick={onClose}
                            title="סגור צ׳אט"
                            aria-label="סגור צ׳אט"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {sendError && (
                <div className="forum-chat-error" role="alert">
                    {sendError}
                </div>
            )}

            <div className="forum-chat-messages" ref={messagesContainerRef}>
                {messages.length === 0 && (
                    <div className="forum-empty">
                        <span className="forum-empty-icon">👋</span>
                        <p>אין הודעות עדיין — היה הראשון לכתוב!</p>
                    </div>
                )}
                {messages.map(function(msg, index) {
                    var isMe = msg.userId === userId;
                    var dateLabel = formatMessageDate(msg.createdAt);
                    var showDateDivider = dateLabel !== lastDateLabel;
                    lastDateLabel = dateLabel;

                    return (
                        <div key={msg.id || index}>
                            {showDateDivider && (
                                <div className="forum-date-divider">
                                    <span>{dateLabel}</span>
                                </div>
                            )}
                            <div className={'forum-message' + (isMe ? ' forum-message--me' : '')}>
                                {!isMe && (
                                    <span className="forum-msg-avatar" aria-hidden="true">
                                        {getInitials(msg.userName)}
                                    </span>
                                )}
                                <div className="forum-msg-body">
                                    <span className="forum-msg-author">{isMe ? 'אני' : msg.userName}</span>
                                    <p className="forum-msg-text">{msg.text}</p>
                                    <span className="forum-msg-time">
                                        {new Date(msg.createdAt).toLocaleTimeString('he-IL', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="forum-chat-input">
                <input
                    type="text"
                    value={inputText}
                    onChange={function(e) { setInputText(e.target.value); }}
                    onKeyDown={handleKeyDown}
                    placeholder={connected ? 'כתוב הודעה...' : 'ממתין לחיבור...'}
                    disabled={!connected}
                />
                <button onClick={handleSend} disabled={!connected || !inputText.trim()}>
                    שלח
                </button>
            </div>
        </div>
    );
}

export default ForumChat;
