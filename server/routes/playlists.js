// server/routes/playlists.js

const express = require('express');
const utils = require('../utils');

const { Member } = utils;
const app = express.Router();

const togglePlaylist = async (id, type, enabled) => {
  const member = await Member.findOne({ spotifyId: id }).exec();
  if (type === 'most') member.mostPlayed.enabled = enabled;
  else member.recentlyAdded.enabled = enabled;
  await member.save();
  return member;
};

const saveSettings = async (id, length, lastfm, period, isMost) => {
  const member = await Member.findOne({ spotifyId: id }).exec();
  if (isMost) member.mostPlayed = { ...member.mostPlayed, enabled: true, length, lastfm, period };
  else member.recentlyAdded = { ...member.recentlyAdded, enabled: true, length };
  await member.save();
  return member;
};

app.get('', utils.ensureAuthenticated, async (req, res) => {
  const { id } = req.user;
  const { mostPlayed, recentlyAdded } = await Member.findOne({ spotifyId: id }).exec();
  res.json({ error: false, mostPlayed, recentlyAdded });
});

app.post('/:type/toggle/', utils.ensureAuthenticated, async (req, res) => {
  const { user: { id }, params: { type }, body: { enable } } = req;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); }
  const { mostPlayed, recentlyAdded } = await togglePlaylist(id, type, enable);
  const response = type === 'most' ? mostPlayed : recentlyAdded;
  delete response.id;
  res.json(response);
});

app.post('/:type/save', utils.ensureAuthenticated, async (req, res) => {
  const {
    user: { id },
    params: { type },
    body: { length, lastfm, period }
  } = req;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); return; }
  const { mostPlayed, recentlyAdded } = await saveSettings(id, +length, lastfm, period, type === 'most');
  const response = type === 'most' ? mostPlayed : recentlyAdded;
  delete response.id;
  res.json(response);
});

module.exports = app;