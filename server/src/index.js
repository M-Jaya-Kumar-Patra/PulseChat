import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { createMessageRepository } from './repositories/messageRepository.js';
import { createMessageService } from './services/messageService.js';
import { createMessageRoutes } from './routes/messageRoutes.js';
import { registerChatSocket } from './socket/chatSocket.js';
import { errorHandler } from './utils/errorHandler.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigins,
    methods: ['GET', 'POST', 'PATCH']
  }
});

const messageRepository = createMessageRepository(env.messageStorePath);
const messageService = createMessageService(messageRepository);

app.use(cors({ origin: env.clientOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/messages', createMessageRoutes({ messageService, io }));
app.use(errorHandler);

registerChatSocket(io, { messageService });

httpServer.listen(env.port, () => {
  console.log(`Chat server running on http://localhost:${env.port}`);
});
