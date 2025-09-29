import { connectToDatabase } from "../db/conn.js";
import { ObjectId } from "mongodb";

export async function getAllContacts(_req, res) {
  const db = await connectToDatabase();
  const contacts = await db.collection("contacts").find().toArray();
  res.json(contacts);
}

export async function getContactById(req, res) {
  const db = await connectToDatabase();
  try {
    const contact = await db.collection("contacts").findOne({ _id: new ObjectId(req.params.id) });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
}