// db/connect.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

let client;
let db;

async function initDb(callback) {
  try {
    if (db) return callback && callback(null, db);

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');

    client = new MongoClient(uri);
    await client.connect();

    // If your URI includes the DB name, this picks that by default.
    // If your URI has no DB name, pass one explicitly:
    // db = client.db('myapp');
    db = client.db();

    console.log('✅ MongoDB connected');
    callback && callback(null, db);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    callback ? callback(err) : (() => { throw err; })();
  }
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🛑 MongoDB connection closed');
  }
}

module.exports = { initDb, getDb, closeDb };