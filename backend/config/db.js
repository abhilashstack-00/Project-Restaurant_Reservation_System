const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

/**
 * Establishes connection to MongoDB using the URI from environment variables.
 * Fails fast on startup if the connection cannot be established, since the
 * API is useless without a database.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const usingMemoryServer = !mongoUri && process.env.NODE_ENV !== 'production';

    if (!mongoUri && process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI is required in production');
    }

    if (usingMemoryServer && !memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }

    const uri = mongoUri || memoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    return { usingMemoryServer };
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
