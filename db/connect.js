// db/connect.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

let client;
let db;

// Initialize the DB once, then reuse
const initDb = async (callback) => {
  try {
    if (db) return callback && callback(null, db);

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');

    client = new MongoClient(uri);
    await client.connect();

    // Your URI includes /myapp, so this selects that DB automatically
    db = client.db();

    console.log('✅ MongoDB connected');
    return callback && callback(null, db);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return callback ? callback(err) : (() => { throw err; })();
  }
};

// Get the database instance after initDb has run
const getDb = () => {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
};

// Optional helper if you need to close during tests
const closeDb = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🛑 MongoDB connection closed');
  }
};

module.exports = { initDb, getDb, closeDb };