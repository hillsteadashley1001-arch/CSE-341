// controllers/auth.controller.js (CommonJS)

// GET /auth/me
async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
}

// POST /auth/logout
async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  res.status(204).send();
}

module.exports = { me, logout };