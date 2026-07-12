import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

const rootDir = process.cwd();

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigins,
  messageStorePath: path.resolve(
    rootDir,
    process.env.MESSAGE_STORE_PATH || 'server/data/messages.json'
  )
};
