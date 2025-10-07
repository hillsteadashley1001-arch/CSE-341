// controllers/contacts.js
const { ObjectId } = require('mongodb');
const dbConn = require('../db/connect');

// Adjust these fields to match your collection schema
const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'];

function validateContact(body) {
  const missing = REQUIRED_FIELDS.filter((k) => !body[k] || body[k] === '');
  return { ok: missing.length === 0, missing };
}

exports.getAll = async (req, res) => {
  try {
    const db = dbConn.getDb();
    const contacts = await db.collection('contacts').find({}).toArray();
    return res.status(200).json(contacts);
  } catch (err) {
    console.error('getAll error:', err);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

exports.getSingle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = dbConn.getDb();
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    if (!contact) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json(contact);
  } catch (err) {
    console.error('getSingle error:', err);
    return res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { ok, missing } = validateContact(req.body);
    if (!ok) return res.status(400).json({ error: 'Missing required fields', missing });

    const doc = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      favoriteColor: req.body.favoriteColor,
      birthday: req.body.birthday
    };

    const db = dbConn.getDb();
    const result = await db.collection('contacts').insertOne(doc);

    // Return new contact id in response body
    return res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error('createContact error:', err);
    return res.status(500).json({ error: 'Failed to create contact' });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    // All fields required per assignment
    const { ok, missing } = validateContact(req.body);
    if (!ok) return res.status(400).json({ error: 'Missing required fields', missing });

    const update = {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        favoriteColor: req.body.favoriteColor,
        birthday: req.body.birthday
      }
    };

    const db = dbConn.getDb();
    const result = await db.collection('contacts').updateOne({ _id: new ObjectId(id) }, update);

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });

    // Success with no body (assignment asks for status code representing success)
    return res.status(204).send();
  } catch (err) {
    console.error('updateContact error:', err);
    return res.status(500).json({ error: 'Failed to update contact' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = dbConn.getDb();
    const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });

    // 200 with confirmation body (204 also acceptable)
    return res.status(200).json({ deleted: true });
  } catch (err) {
    console.error('deleteContact error:', err);
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
};