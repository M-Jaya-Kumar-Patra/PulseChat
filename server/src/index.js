import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { connectToMongo } from './config/database.js';
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

app.use(cors({ origin: env.clientOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    storage: 'mongodb',
    timestamp: new Date().toISOString()
  });
});

const start = async () => {
  const { client: mongoClient, db } = await connectToMongo();
  const messageRepository = createMessageRepository(
    db.collection(env.mongodb.messagesCollection)
  );
  await messageRepository.init();

  const messageService = createMessageService(messageRepository);

  app.use('/api/messages', createMessageRoutes({ messageService, io }));
  app.use(errorHandler);

  registerChatSocket(io, { messageService });

  const server = httpServer.listen(env.port, () => {
    console.log(`Chat server running on http://localhost:${env.port}`);
    console.log(
      `MongoDB connected to database "${env.mongodb.dbName}", collection "${env.mongodb.messagesCollection}"`
    );
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongoClient.close();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

start().catch((error) => {
  console.error('Failed to start chat server:', error.message);
  process.exit(1);
});
