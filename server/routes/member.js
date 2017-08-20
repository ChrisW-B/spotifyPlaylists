const express = require('express'),
  app = express.Router(),
  passport = require('passport'),
  SpotifyStrategy = require('passport-spotify').Strategy,
  utils = require('../utils');

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
passport.use(
  new SpotifyStrategy({
      clientID: utils.config.spotify.clientId,
      clientSecret: utils.config.spotify.clientSecret,
      callbackURL: utils.config.spotify.redirectUri
    },
    async(accessToken, refreshToken, profile, done) => {
      await saveToRedis({
        access: accessToken,
        refresh: refreshToken,
        userId: profile.id
      });
      profile.access = accessToken;
      profile.refresh = refreshToken;
      return done(null, profile);
    }
  )
);

app.get('/login', passport.authenticate('spotify', { scope: utils.config.spotify.scopes, showDialog: true }));
app.get('/setup', passport.authenticate('spotify'), (req, res) => res.json({ ...req.user, isAdmin: req.user.id === utils.config.admin }));
app.get('/info', utils.ensureAuthenticated, (req, res) => res.json({ ...req.user, isAdmin: req.user.id === utils.config.admin }));
app.get('/logout', utils.ensureAuthenticated, (req, res) => req.logout());
app.get('/delete', utils.ensureAuthenticated, async(req, res) => {
  deleteMember(req.user.id);
  req.logout();
});

const deleteMember = async(memberId) => {
    await utils.redis.del(memberId);
    await utils.redis.srem('users', memberId);
  },
  saveToRedis = async data => {
    const exists = await utils.redis.exists(data.userId);
    if (!exists) {
      await utils.redis.sadd('users', data.userId);
      await utils.redis.hmset(data.userId,
        'access', data.access,
        'refresh', data.refresh,
        'most', 'false',
        'recent', 'false');
    } else utils.logger.server(`${data.userId} already added!`);
  };

module.exports = app;