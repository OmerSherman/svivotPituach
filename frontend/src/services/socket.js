import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

// single shared connection for the whole app
const socket = io(SOCKET_URL, {
    autoConnect: true
});

export default socket;
