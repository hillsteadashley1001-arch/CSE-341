const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

// Collection name - replace with your desired collection
const COLLECTION = 'items';

const getAllItems = async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTION).find().toArray();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const db = getDb();
    const id = new ObjectId(req.params.id);
    const item = await db.collection(COLLECTION).findOne({ _id: id });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const db = getDb();
    const newItem = req.body;
    const result = await db.collection(COLLECTION).insertOne(newItem);
    
    // The inserted document's ID is in result.insertedId
    newItem._id = result.insertedId;
    
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem
};