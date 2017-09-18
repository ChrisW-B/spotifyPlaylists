// server/routes/member.js
const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const utils = require('../utils');

const app = express.Router();

const deleteMember = memberId =>
  utils.db.remove({ spotifyId: memberId });

const save = async ({ access, refresh, userId }) => {
  const member = await utils.db.findOne({ spotifyId: userId });
  if (!member) {
    await utils.db.insert({
      spotifyId: userId,
      visits: 1,
      refreshToken: refresh,
      accessToken: access,
      mostPlayed: { period: undefined, id: undefined, lastfm: undefined, length: undefined, enabled: false },
      recentlyAdded: { id: undefined, length: undefined, enabled: false }
    });
  } else {
    await utils.db.findAndModify({
      query: member,
      update: { $set: { accessToken: access, refreshToken: refresh }, $inc: { visits: 1 } }
    });
    utils.logger.server(`${userId} already added!`);
  }
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
      await save({ access, refresh, userId: profile.id });
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