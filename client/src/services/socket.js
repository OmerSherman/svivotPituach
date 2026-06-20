import { io } from 'socket.io-client';

// single shared connection for the whole app
const socket = io('http://localhost:3000', {
    autoConnect: true
});

export default socket;
