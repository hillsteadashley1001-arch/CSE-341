// routes/auth.routes.js
const express = require('express');
const passport = require('passport');
const { authRequired } = require('../middleware/auth.js');
const authController = require('../controllers/auth.controller.js');
const { setAuthCookie } = require('../auth/jwt.js');

const router = express.Router();

// Start Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Handle callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google', session: false }),
  (req, res) => {
    setAuthCookie(res, req.user);
    res.redirect(process.env.POST_AUTH_REDIRECT || '/docs');
  }
);

// Useful helpers
router.get('/me', authRequired, authController.me);
router.post('/logout', authRequired, authController.logout);

module.exports = router;