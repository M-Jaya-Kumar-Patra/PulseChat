const typingUsers = new Map();
const onlineUsers = new Map();

const buildPresence = () => {
  const users = Array.from(onlineUsers.values());
  const grouped = users.reduce((acc, user) => {
    const existing = acc.get(user.username);

    if (existing) {
      existing.connections += 1;
      existing.lastSeenAt = user.joinedAt;
      return acc;
    }

    acc.set(user.username, {
      username: user.username,
      connections: 1,
      lastSeenAt: user.joinedAt
    });

    return acc;
  }, new Map());

  return Array.from(grouped.values()).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
};

const emitPresence = (io) => {
  io.emit('presence:update', buildPresence());
};

const emitTyping = (io) => {
  io.emit(
    'typing:update',
    Array.from(typingUsers.values()).map(({ username }) => ({ username }))
  );
};

const stopTyping = (io, socketId) => {
  const typingUser = typingUsers.get(socketId);
  if (!typingUser) return;

  clearTimeout(typingUser.timeout);
  typingUsers.delete(socketId);
  emitTyping(io);
};

export const registerChatSocket = (io, { messageService }) => {
  io.on('connection', (socket) => {
    socket.emit('presence:update', buildPresence());
    emitTyping(io);

    socket.on('user:join', ({ username } = {}) => {
      const cleanUsername = String(username || '').trim();

      if (!cleanUsername) {
        socket.emit('error:message', 'Username is required to join.');
        return;
      }

      socket.data.username = cleanUsername;
      onlineUsers.set(socket.id, {
        username: cleanUsername,
        joinedAt: new Date().toISOString()
      });

      emitPresence(io);
    });

    socket.on('message:send', async (payload = {}, callback) => {
      try {
        const username = socket.data.username || payload.username;
        const message = await messageService.createMessage({
          ...payload,
          username
        });

        stopTyping(io, socket.id);
        io.emit('message:new', message);

        if (typeof callback === 'function') {
          callback({ ok: true, message });
        }
      } catch (error) {
        const message = error.message || 'Could not send message.';
        socket.emit('error:message', message);

        if (typeof callback === 'function') {
          callback({ ok: false, message });
        }
      }
    });

    socket.on('typing:start', ({ username } = {}) => {
      const cleanUsername = String(socket.data.username || username || '').trim();
      if (!cleanUsername) return;

      const existing = typingUsers.get(socket.id);
      if (existing?.timeout) {
        clearTimeout(existing.timeout);
      }

      typingUsers.set(socket.id, {
        username: cleanUsername,
        timeout: setTimeout(() => stopTyping(io, socket.id), 2500)
      });

      emitTyping(io);
    });

    socket.on('typing:stop', () => {
      stopTyping(io, socket.id);
    });

    socket.on('message:read', async ({ messageId, username } = {}) => {
      try {
        const reader = socket.data.username || username;
        const message = await messageService.markRead({ messageId, username: reader });

        io.emit('message:read', {
          messageId: message.id,
          readBy: message.readBy
        });
      } catch (error) {
        socket.emit('error:message', error.message || 'Could not update read status.');
      }
    });

    socket.on('disconnect', () => {
      stopTyping(io, socket.id);
      onlineUsers.delete(socket.id);
      emitPresence(io);
    });
  });
};
