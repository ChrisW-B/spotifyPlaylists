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

app.get('/login', passport.authenticate('spotify', {
  scope: utils.config.spotify.scopes,
  showDialog: true,
  successRedirect: '/',
  failureRedirect: '/'
}));
app.get('/setup', passport.authenticate('spotify', {
  scope: utils.config.spotify.scopes,
  showDialog: true,
  successRedirect: '/',
  failureRedirect: '/'
}));

app.get('', utils.ensureAuthenticated, (req, res) => {
  delete req.user.access;
  delete req.user.refresh;
  delete req.user['_json'];
  delete req.user['_raw'];
  res.json({ ...req.user, isAdmin: req.user.id === utils.config.admin });
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

const deleteMember = async(memberId, logout) => {
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

module.exports = app;