// middleware/auth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Book = require('../models/Book.js');
const Review = require('../models/Review.js');

const MODEL_MAP = { Book, Review };

function authRequired(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload.userId; // we now sign user._id -> userId
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    req.user = { id, email: payload.email, name: payload.name };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * ownerRequired(modelName, options?)
 * - modelName: 'Book' | 'Review'
 * - options.paramName: name of the route param containing the document id (default: 'id')
 * - options.selectId: function(req) -> string to extract the id (overrides paramName)
 */
function ownerRequired(modelName, options = {}) {
  const { paramName = 'id', selectId } = options;

  return async (req, res, next) => {
    try {
      const Model = MODEL_MAP[modelName];
      if (!Model) return res.status(500).json({ message: `Unknown model ${modelName}` });

      const docId = typeof selectId === 'function' ? selectId(req) : req.params?.[paramName];
      if (!docId || !mongoose.isValidObjectId(docId)) {
        return res.status(400).json({ message: 'Invalid id' });
      }

      // Short timeout to avoid indefinite waits
      const withTimeout = (p, ms = 5000) =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(Object.assign(new Error('DB timeout'), { status: 504 })), ms)
          ),
        ]);

      const doc = await withTimeout(Model.findById(docId).exec());
      if (!doc) return res.status(404).json({ message: 'Not found' });

      const userId = req.user?.id?.toString();
      const ownerField = modelName === 'Book' ? 'owner' : 'reviewer';
      const docOwner = doc[ownerField]?.toString();

      if (!userId || docOwner !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      req.resource = doc;
      return next();
    } catch (e) {
      if (e?.message === 'DB timeout') {
        return res.status(504).json({ message: 'Request timed out while checking ownership' });
      }
      if (e?.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid id' });
      }
      return next(e);
    }
  };
}

module.exports = { authRequired, ownerRequired };