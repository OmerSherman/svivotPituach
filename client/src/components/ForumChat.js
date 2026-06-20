import { useState, useEffect, useRef, useContext } from 'react';
import socket from '../services/socket';
import userContext from '../contexts/userContext';

function ForumChat({ room, roomName }) {
    var [messages, setMessages] = useState([]);
    var [onlineCount, setOnlineCount] = useState(0);
    var [inputText, setInputText] = useState('');
    var messagesEndRef = useRef(null);
    var { user } = useContext(userContext);

    var userId = user ? user.userId : 0;
    var userName = user ? user.firstName : 'Guest';

    // scroll to bottom whenever a new message arrives
    useEffect(function() {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(function() {
        // load message history from REST
        fetch('http://localhost:3000/api/forum/' + room + '/messages')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) setMessages(data.data);
            })
            .catch(function(err) {
                console.error('Could not load chat history', err);
            });

        // join the Socket.IO room
        socket.emit('room:join', { room: room });

        function handleNewMessage(msg) {
            // only append if it belongs to the currently open room
            if (msg.room === room) {
                setMessages(function(prev) { return [...prev, msg]; });
            }
        }

        function handlePresence(data) {
            if (data.room === room) setOnlineCount(data.count);
        }

        socket.on('message:new', handleNewMessage);
        socket.on('presence:update', handlePresence);

        // cleanup: only remove listeners, don't leave the room.
        // leaving on cleanup would cause StrictMode's double-invoke to kick us out
        // of the room right before the second mount re-joins. presence updates on disconnect.
        return function() {
            socket.off('message:new', handleNewMessage);
            socket.off('presence:update', handlePresence);
        };
    }, [room]);

    function handleSend() {
        if (!inputText.trim()) return;

        var text = inputText.trim();

        // add my own message to the UI immediately, without waiting for the server
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
        if (e.key === 'Enter') handleSend();
    }

    return (
        <div className="forum-chat">
            <div className="forum-chat-header">
                <h3 className="forum-chat-title">{roomName}</h3>
                <span className="forum-online-badge">{onlineCount} מחוברים</span>
            </div>

            <div className="forum-chat-messages">
                {messages.length === 0 && (
                    <p className="forum-empty">אין הודעות עדיין — היה הראשון!</p>
                )}
                {messages.map(function(msg) {
                    var isMe = msg.userId === userId;
                    return (
                        <div key={msg.id} className={'forum-message' + (isMe ? ' forum-message--me' : '')}>
                            <span className="forum-msg-author">{msg.userName}</span>
                            <p className="forum-msg-text">{msg.text}</p>
                            <span className="forum-msg-time">
                                {new Date(msg.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="forum-chat-input">
                <input
                    type="text"
                    value={inputText}
                    onChange={function(e) { setInputText(e.target.value); }}
                    onKeyDown={handleKeyDown}
                    placeholder="כתוב הודעה..."
                />
                <button onClick={handleSend}>שלח</button>
            </div>
        </div>
    );
}

export default ForumChat;
