// auth/jwt.js (CommonJS)
const jwt = require('jsonwebtoken');

function setAuthCookie(res, user) {
  const payload = { userId: user._id.toString(), email: user.email, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

module.exports = { setAuthCookie };