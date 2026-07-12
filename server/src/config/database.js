import { MongoClient } from 'mongodb';
import { env } from './env.js';

export const connectToMongo = async () => {
  if (env.mongodb.isDummyUri) {
    throw new Error(
      'MONGODB_URI is still using the dummy value. Copy server/.env.example to server/.env and replace it with your MongoDB connection string.'
    );
  }

  const client = new MongoClient(env.mongodb.uri, {
    serverSelectionTimeoutMS: 10000
  });

  await client.connect();

  return {
    client,
    db: client.db(env.mongodb.dbName)
  };
};
