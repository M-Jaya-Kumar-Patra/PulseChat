import { io } from 'socket.io-client';

const serverUrl = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:5000';
const timeoutMs = 5000;

const waitFor = (eventName, socket) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => {
    reject(new Error(`Timed out waiting for ${eventName}.`));
  }, timeoutMs);

  socket.once(eventName, (...args) => {
    clearTimeout(timer);
    resolve(args);
  });
});

const alice = io(serverUrl, { transports: ['websocket', 'polling'] });
const bob = io(serverUrl, { transports: ['websocket', 'polling'] });

try {
  await Promise.all([
    waitFor('connect', alice),
    waitFor('connect', bob)
  ]);

  alice.emit('user:join', { username: 'SocketAlice' });
  bob.emit('user:join', { username: 'SocketBob' });

  const receivedByBob = waitFor('message:new', bob);

  alice.emit('message:send', {
    username: 'SocketAlice',
    text: 'Socket smoke test',
    clientId: `socket-smoke-${Date.now()}`
  }, (response) => {
    if (!response?.ok) {
      throw new Error(response?.message || 'Socket send was rejected.');
    }
  });

  const [message] = await receivedByBob;

  if (message.text !== 'Socket smoke test') {
    throw new Error('Bob received a different message.');
  }

  console.log('Socket smoke test passed.');
} finally {
  alice.disconnect();
  bob.disconnect();
}
