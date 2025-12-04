// auth/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.OAUTH_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // IMPORTANT: use profile.id (no brackets, no link markup)
        let user = await User.findOne({ provider: 'google', providerId: profile.id });
        if (!user) {
          user = await User.create({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
        }
        return done(null, user); // DB user (has _id)
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;