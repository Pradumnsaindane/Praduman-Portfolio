import mongoose from 'mongoose';

/**
 * Connect to MongoDB. Throws if MONGO_URI is missing or the connection fails,
 * so the caller (server.js) can decide how to handle a failed startup.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set — copy server/.env.example to server/.env and fill it in.');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`✔ MongoDB connected: ${conn.connection.host}`);
  return conn;
};

export default connectDB;
