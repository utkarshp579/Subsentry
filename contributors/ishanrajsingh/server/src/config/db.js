import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('❌ Please define MONGO_URI in environment variables');
}

mongoose.set('strictQuery', false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected');
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection failed', err);
    throw err;
  }
}
