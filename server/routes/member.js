// server/routes/member.js
const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const utils = require('../utils');

const app = express.Router();
const deleteMember = async(memberId) => {
  await utils.redis.del(memberId);
  await utils.redis.srem('users', memberId);
};
const saveToRedis = async(data) => {
  if (!(await utils.redis.exists(data.userId))) {
    await utils.redis.sadd('users', data.userId);
    await utils.redis.hmset(data.userId,
      'access', data.access,
      'refresh', data.refresh,
      'most', 'false',
      'recent', 'false');
  } else utils.logger.server(`${data.userId} already added!`);
};

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new SpotifyStrategy(
    ({
      clientID: process.env.SPOTIFY_ID,
      clientSecret: process.env.SPOTIFY_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT
    }),
    async (access, refresh, profile, done) => {
      await saveToRedis({ access, refresh, userId: profile.id });

      return done(null, { ...profile, access, refresh });
    }
  ));

app.get('/login', passport.authenticate('spotify', {
  scope: process.env.SPOTIFY_SCOPES.split(','),
  showDialog: true,
  successRedirect: '/',
  failureRedirect: '/'
}));
app.get('/setup', passport.authenticate('spotify', {
  scope: process.env.SPOTIFY_SCOPES.split(','),
  showDialog: true,
  successRedirect: '/loggedin',
  failureRedirect: '/'
}));

app.get('', utils.ensureAuthenticated, (req, res) => {
  delete req.user.access;
  delete req.user.refresh;
  /* eslint-disable no-underscore-dangle */
  // beacuse spotify is bad
  delete req.user._json;
  delete req.user._raw;
  /* eslint-enable no-underscore-dangle */
  res.json({ ...req.user, isAdmin: req.user.id === process.env.ADMIN });
});

app.delete('', utils.ensureAuthenticated, async(req, res) => {
  await deleteMember(req.user.id);
  req.logout();
  req.session.destroy(() => {});
  res.sendStatus(401);
});
app.get('/logout', utils.ensureAuthenticated, (req, res) => {
  req.logout();
  req.session.destroy(() => {});
  res.sendStatus(401);
});

module.exports = app;