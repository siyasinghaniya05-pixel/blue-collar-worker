const mongoose = require('mongoose');
const path = require('path');

let startsMemoryServer = false;
let mongod = null;

const dataPath = process.env.MONGODB_DATA_PATH || path.join(__dirname, '..', '.data', 'db');

/**
 * Connect to MongoDB.
 *
 * Priority:
 *  1. If MONGODB_URI is set to an explicit (non-default) Mongo URI, use it directly.
 *  2. Otherwise, start an embedded MongoDB instance (mongodb-memory-server) reusing
 *     the downloaded mongod binary with a persistent data directory so seeded data
 *     survives restarts. This lets the whole app run with zero external setup.
 */
const connectDB = async () => {
  try {
    const explicit = process.env.MONGODB_URI || '';
    const isDefault = !explicit || explicit.includes('localhost:27017/skillserve');

    if (!isDefault) {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      process.env.MONGODB_ACTIVE_URI = process.env.MONGODB_URI;
      return conn;
    }

    // Embedded / in-process MongoDB
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dataPath,
        storageEngine: 'wiredTiger',
        startupTimeout: 120000,
      },
      binary: { version: '6.0.14' },
    });
    startsMemoryServer = true;
    const uri = mongod.getUri('skillserve');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected (in-process): ${conn.connection.host}`);
    console.log(`  Data directory: ${dataPath}`);
    process.env.MONGODB_ACTIVE_URI = uri;
    // Avoid verbose warnings
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

const stopDB = async () => {
  try {
    await mongoose.disconnect();
    if (startsMemoryServer && mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error stopping DB:', err.message);
  }
};

module.exports = { connectDB, stopDB, isEmbedded: () => startsMemoryServer };