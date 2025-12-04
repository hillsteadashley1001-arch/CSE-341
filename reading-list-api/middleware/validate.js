// middleware/validate.js (CommonJS)
const { validationResult } = require('express-validator');

function validate(rules = []) {
  const normalized = Array.isArray(rules) ? rules : [rules];
  return [
    ...normalized,
    (req, res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.array().map(e => ({
          type: e.type,
          value: e.value,
          msg: e.msg,
          path: e.path,
          location: e.location,
        })),
      });
    },
  ];
}

module.exports = { validate };