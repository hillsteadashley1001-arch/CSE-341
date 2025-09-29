import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db(); // Uses the database specified in your connection string
  }
  return db;
}