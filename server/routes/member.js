// server/routes/member.js
const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const utils = require('../utils');

const { Member } = utils;
const app = express.Router();

const save = async ({ access, refresh, userId, photos }) => {
  const member = await Member.findOne({ spotifyId: userId }).exec();
  const photo = photos.length ? photos[0] : '';
  if (!member) {
    const newMember = new Member({
      spotifyId: userId,
      refreshToken: refresh,
      accessToken: access,
      isAdmin: userId === process.env.ADMIN,
      photo
    });
    await newMember.save();
  } else {
    member.accessToken = access;
    member.refreshToken = refresh;
    member.photo = photo;
    member.visits += 1;
    await member.save();
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
      await save({ access, refresh, userId: profile.id, photos: profile.photos });
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

module.exports = app;