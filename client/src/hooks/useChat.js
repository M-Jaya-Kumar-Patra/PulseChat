import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMessages, markMessageRead, postMessage } from '../services/api.js';
import { createChatSocket } from '../services/socket.js';

const upsertMessage = (messages, nextMessage) => {
  const matchIndex = messages.findIndex((message) => {
    return (
      message.id === nextMessage.id ||
      (message.clientId && message.clientId === nextMessage.clientId)
    );
  });

  if (matchIndex === -1) {
    return [...messages, nextMessage].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  const nextMessages = [...messages];
  nextMessages[matchIndex] = {
    ...nextMessages[matchIndex],
    ...nextMessage
  };

  return nextMessages;
};

const updateReadBy = (messages, { messageId, readBy }) => {
  return messages.map((message) => {
    if (message.id !== messageId) {
      return message;
    }

    return {
      ...message,
      readBy,
      status: readBy.length > 1 ? 'read' : message.status
    };
  });
};

export function useChat(username) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  const readIncomingMessages = useCallback((nextMessages) => {
    const socket = socketRef.current;

    nextMessages
      .filter((message) => {
        return (
          message.id &&
          message.username !== username &&
          !(message.readBy || []).includes(username)
        );
      })
      .forEach((message) => {
        if (socket?.connected) {
          socket.emit('message:read', {
            messageId: message.id,
            username
          });
        } else {
          markMessageRead(message.id, username).catch(() => {});
        }
      });
  }, [username]);

  const refreshMessages = useCallback(async () => {
    if (!username) return;

    setIsLoading(true);
    setError('');

    try {
      const history = await fetchMessages();
      setMessages(history);
      readIncomingMessages(history);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [readIncomingMessages, username]);

  useEffect(() => {
    if (!username) return;

    refreshMessages();
  }, [refreshMessages, username]);

  useEffect(() => {
    if (!username) return;

    const socket = createChatSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionState('connected');
      setError('');
      socket.emit('user:join', { username });
    });

    socket.on('disconnect', () => {
      setConnectionState('offline');
    });

    socket.on('connect_error', () => {
      setConnectionState('offline');
      setError('Unable to reach the chat server.');
    });

    socket.on('presence:update', setOnlineUsers);

    socket.on('typing:update', (users) => {
      const uniqueNames = Array.from(
        new Set(users.map((user) => user.username).filter(Boolean))
      );
      setTypingUsers(uniqueNames);
    });

    socket.on('message:new', (message) => {
      setMessages((current) => upsertMessage(current, message));
      readIncomingMessages([message]);
    });

    socket.on('message:read', (payload) => {
      setMessages((current) => updateReadBy(current, payload));
    });

    socket.on('error:message', (message) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [readIncomingMessages, username]);

  const sendMessage = useCallback(async (text) => {
    const clientId = crypto.randomUUID();
    const pendingMessage = {
      id: clientId,
      clientId,
      username,
      text,
      createdAt: new Date().toISOString(),
      status: 'sending',
      readBy: [username]
    };

    setMessages((current) => upsertMessage(current, pendingMessage));
    setError('');

    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit(
        'message:send',
        { username, text, clientId },
        (response = {}) => {
          if (response.ok && response.message) {
            setMessages((current) => upsertMessage(current, response.message));
            return;
          }

          setMessages((current) =>
            upsertMessage(current, {
              ...pendingMessage,
              status: 'failed'
            })
          );
          setError(response.message || 'Message was not sent.');
        }
      );
      return;
    }

    try {
      const savedMessage = await postMessage({ username, text, clientId });
      setMessages((current) => upsertMessage(current, savedMessage));
    } catch (apiError) {
      setMessages((current) =>
        upsertMessage(current, {
          ...pendingMessage,
          status: 'failed'
        })
      );
      setError(apiError.message);
    }
  }, [username]);

  const startTyping = useCallback(() => {
    socketRef.current?.emit('typing:start', { username });
  }, [username]);

  const stopTyping = useCallback(() => {
    socketRef.current?.emit('typing:stop', { username });
  }, [username]);

  return useMemo(() => ({
    messages,
    onlineUsers,
    typingUsers,
    connectionState,
    error,
    isLoading,
    sendMessage,
    startTyping,
    stopTyping,
    refreshMessages
  }), [
    messages,
    onlineUsers,
    typingUsers,
    connectionState,
    error,
    isLoading,
    sendMessage,
    startTyping,
    stopTyping,
    refreshMessages
  ]);
}
