// server/routes/playlists.js

const express = require('express');
const utils = require('../utils');

const app = express.Router();

const toggleMostPlayed = async(id, enabled) => utils.db.findAndModify({
  query: { spotifyId: id },
  update: { $set: { 'mostPlayed.enabled': enabled } },
  new: true
});
const toggleRecentlyAdded = async(id, enabled) => utils.db.findAndModify({
  query: { spotifyId: id },
  update: { $set: { 'recentlyAdded.enabled': enabled } },
  new: true
});

const togglePlaylist = async(id, type, enabled) =>
  (type === 'most'
    ? toggleMostPlayed(id, enabled)
    : toggleRecentlyAdded(id, enabled));

const saveSettings = async(id, numTracks, lastfm, period, isMost) =>
  ((isMost)
    ? utils.db.findAndModify({
      query: { spotifyId: id },
      update: {
        $set: {
          'mostPlayed.enabled': true,
          'mostPlayed.length': numTracks,
          'mostPlayed.lastfm': lastfm,
          'mostPlayed.period': period
        }
      },
      new: true
    })
    : utils.db.findAndModify({
      query: { spotifyId: id },
      update: {
        $set: {
          'recentlyAdded.enabled': true,
          'recentlyAdded.length': numTracks
        }
      },
      new: true
    }));

app.get('', utils.ensureAuthenticated, async(req, res) => {
  const { id } = req.user;
  const { mostPlayed, recentlyAdded } = await utils.db.findOne({ spotifyId: id });
  res.json({ error: false, mostPlayed, recentlyAdded });
});

app.post('/:type/toggle/', utils.ensureAuthenticated, async(req, res) => {
  const { user: { id }, params: { type }, body: { enable } } = req;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); }
  const { value } = await togglePlaylist(id, type, enable);
  const response = type === 'most' ? value.mostPlayed : value.recentlyAdded;
  delete response.id;
  res.json(response);
});

app.post('/:type/save', utils.ensureAuthenticated, async(req, res) => {
  const {
    user: { id },
    params: { type },
    body: { length, lastfm, period }
  } = req;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); return; }
  const { value } = await saveSettings(id, +length, lastfm, period, type === 'most');
  const response = type === 'most' ? value.mostPlayed : value.recentlyAdded;
  delete response.id;
  res.json(response);
});

module.exports = app;