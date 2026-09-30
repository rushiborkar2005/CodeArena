export const setupSockets = (io) => {
  const rooms = {}; // roomId -> { users: [{ id, username }] }

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_room', ({ roomId, username }) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { users: [] };
      }

      if (rooms[roomId].users.length >= 2) {
        socket.emit('room_full', { message: 'Room is already full.' });
        return;
      }

      rooms[roomId].users.push({ id: socket.id, username });
      socket.join(roomId);

      io.to(roomId).emit('user_joined', {
        users: rooms[roomId].users,
        message: `${username} has joined the room.`
      });

      console.log(`${username} joined room ${roomId}`);
    });

    socket.on('code_submission', ({ roomId, username, status, message }) => {
      // Broadcast to others in the room
      socket.to(roomId).emit('partner_submission', {
        username,
        status, // 'success' or 'error'
        message
      });
    });

    socket.on('code_change', ({ roomId, code }) => {
      // (Optional) if they want to see each other's code live, not strictly requested but nice to have. The requirement says "submit code other should know". We can skip real-time sync if not required, but let's keep it minimal if needed.
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
          const user = room.users[userIndex];
          room.users.splice(userIndex, 1);
          
          io.to(roomId).emit('user_left', {
            users: room.users,
            message: `${user.username} has left the room.`
          });

          if (room.users.length === 0) {
            delete rooms[roomId];
          }
          break;
        }
      }
    });
  });
};
