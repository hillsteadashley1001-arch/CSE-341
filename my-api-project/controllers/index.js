// controllers/index.js
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
    if (!ObjectId.isValid(req.params.id)) {
      const e = new Error('Invalid ID');
      e.status = 400;
      return next(e);
    }

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

    newItem._id = result.insertedId;
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};

// controllers/index.js
const updateItem = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      const e = new Error('Invalid ID');
      e.status = 400;
      return next(e);
    }

    const { _id, ...payload } = req.body ?? {};
    if (!payload || Object.keys(payload).length === 0) {
      const e = new Error('No fields to update');
      e.status = 400;
      return next(e);
    }

    const db = getDb();
    const id = new ObjectId(req.params.id);

    // 1) Update
    const upd = await db.collection(COLLECTION).updateOne({ _id: id }, { $set: payload });

    // 2) Not found
    if (!upd.matchedCount) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // 3) Return the updated doc (consistent across driver versions)
    const updated = await db.collection(COLLECTION).findOne({ _id: id });
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      const e = new Error('Invalid ID');
      e.status = 400;
      return next(e);
    }
    const db = getDb();
    const id = new ObjectId(req.params.id);
    const del = await db.collection(COLLECTION).deleteOne({ _id: id });

    if (del.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};