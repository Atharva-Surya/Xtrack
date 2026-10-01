import { Server } from 'socket.io';

export function attachRealtime(httpServer, clientUrl) {
  const io = new Server(httpServer, { cors: { origin: clientUrl } });

  io.on('connection', (socket) => {
    socket.on('events:join', (eventIds) => {
      if (!Array.isArray(eventIds)) return;
      for (const room of socket.rooms) {
        if (room.startsWith('event:')) socket.leave(room);
      }
      for (const eventId of eventIds) {
        if (typeof eventId === 'string' && eventId.length > 0 && eventId.length <= 200) {
          socket.join(`event:${eventId}`);
        }
      }
    });
  });

  return io;
}

let activeIo;

export function setRealtimeServer(io) {
  activeIo = io;
}

export function emitFriendsAttending(eventId, friendsAttending) {
  activeIo?.to(`event:${eventId}`).emit('friends-attending:update', { eventId, friendsAttending });
}