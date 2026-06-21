// Omer owns messageRepo - adjust the require path if needed
const messageRepo = require('../repositories/messageRepo');

function registerForumSocket(io) {
    io.on('connection', function(socket) {
        console.log('socket connected: ' + socket.id);

        // client joins a room (e.g. "country_1" or "city_3")
        socket.on('room:join', function(data) {
            var room = data.room;
            if (!room) return;

            socket.join(room);

            // track which rooms this socket joined so we can update presence on disconnect
            if (!socket.joinedRooms) {
                socket.joinedRooms = [];
            }
            if (!socket.joinedRooms.includes(room)) {
                socket.joinedRooms.push(room);
            }

            emitPresence(io, room);
        });

        // client leaves a room without disconnecting
        socket.on('room:leave', function(data) {
            var room = data.room;
            if (!room) return;

            socket.leave(room);

            if (socket.joinedRooms) {
                socket.joinedRooms = socket.joinedRooms.filter(function(r) {
                    return r !== room;
                });
            }

            emitPresence(io, room);
        });

        // client sends a chat message
        socket.on('message:send', async function(data) {
            var room = data.room;
            var userId = data.userId;
            var userName = data.userName || ('User ' + userId);
            var text = data.text;

            if (!text || text.trim() === '') return;

            try {
                var saved = await messageRepo.create({
                    room: room,
                    userId: parseInt(userId) || 0,
                    userName: userName,
                    text: text.trim()
                });

                // send to everyone in the room EXCEPT the sender
                // (the sender adds their own message optimistically on the client)
                socket.to(room).emit('message:new', saved);
            } catch (err) {
                console.error('Error saving message:', err);
                socket.emit('message:error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', function() {
            // update presence for every room this socket was in
            var rooms = socket.joinedRooms || [];
            for (var i = 0; i < rooms.length; i++) {
                emitPresence(io, rooms[i]);
            }
        });
    });
}

// emit current connected-user count to everyone in a room
function emitPresence(io, room) {
    var clients = io.sockets.adapter.rooms.get(room);
    var count = clients ? clients.size : 0;
    io.to(room).emit('presence:update', { room: room, count: count });
}

module.exports = registerForumSocket;
