// server/routes/member.js
const express = require('express'),
  app = express.Router(),
  passport = require('passport'),
  SpotifyStrategy = require('passport-spotify').Strategy,
  utils = require('../utils'),

  deleteMember = async (memberId, logout) => {
    await utils.redis.del(memberId);
    await utils.redis.srem('users', memberId);
  },
  saveToRedis = async data => {
    if (!(await utils.redis.exists(data.userId))) {
      await utils.redis.sadd('users', data.userId);
      await utils.redis.hmset(data.userId,
        'access', data.access,
        'refresh', data.refresh,
        'most', 'false',
        'recent', 'false');
    } else utils.logger.server(`${data.userId} already added!`);
  };

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
passport.use(
  new SpotifyStrategy({
    clientID: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    callbackURL: process.env.SPOTIFY_REDIRECT
  },
  async (accessToken, refreshToken, profile, done) => {
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
  delete req.user['_json'];
  delete req.user['_raw'];
  res.json({ ...req.user, isAdmin: req.user.id === process.env.ADMIN });
});

app.delete('', utils.ensureAuthenticated, async (req, res) => {
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