import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
export const realtimeSocket = io(new URL(apiUrl, window.location.origin).origin, { autoConnect: false });