import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(serverRoot, '.env'), quiet: true });

export const dummyMongoUri =
  'mongodb+srv://chat_user:chat_password@cluster0.example.mongodb.net/realtime-chat?retryWrites=true&w=majority';

const clean = (value) => String(value || '').trim();

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const mongoUri = clean(process.env.MONGODB_URI) || dummyMongoUri;

export const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigins,
  mongodb: {
    uri: mongoUri,
    dbName: clean(process.env.MONGODB_DB_NAME) || 'realtime-chat',
    messagesCollection: clean(process.env.MONGODB_MESSAGES_COLLECTION) || 'messages',
    isDummyUri:
      mongoUri === dummyMongoUri ||
      mongoUri.includes('chat_user:chat_password') ||
      mongoUri.includes('cluster0.example.mongodb.net')
  }
};
