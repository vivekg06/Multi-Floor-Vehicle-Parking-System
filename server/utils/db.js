import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    console.log('Connecting to external MongoDB:', uri.replace(/:[^:]+@/, ':***@'));
    try {
      return await mongoose.connect(uri);
    } catch (error) {
      console.error('Failed to connect to external MongoDB. Falling back to In-Memory DB.', error);
    }
  }

  console.log('No MONGODB_URI found. Starting In-Memory MongoDB server...');
  try {
    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'smartpark', port: 57017 }
    });
    const mongoUri = mongod.getUri();
    console.log(`In-Memory MongoDB server running at: ${mongoUri}`);
    mongoose.connection.on('connected', () => console.log('Successfully connected to In-Memory MongoDB.'));
    mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
    return await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to start In-Memory MongoDB:', error);
    throw error;
  }
}

