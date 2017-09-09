// server/routes/playlists.js

const express = require('express');
const utils = require('../utils');

const app = express.Router();
const disablePlaylist = async (id, type) => utils.redis.hset(id, type, false);
const enablePlaylist = async (id, type) => utils.redis.hset(id, type, true);
const saveSettings = async (id, numTracks, lastfm, period, isMost) =>
  ((isMost)
    ? utils.redis.hmset(id,
      'most', true,
      'most:length', numTracks,
      'most:playlist', 'null',
      'most:lastfm', lastfm,
      'most:period', period) : utils.redis.hmset(id,
      'recent', true,
      'recent:length', numTracks,
      'recent:playlist', 'null'));

const getCurrentSettings = async (id, isMost) =>
  (isMost
    ? ({
      enabled: String(await utils.redis.hget(id, 'most')).toLowerCase() === 'true',
      length: +(await utils.redis.hget(id, 'most:length')),
      lastfm: await utils.redis.hget(id, 'most:lastfm'),
      period: await utils.redis.hget(id, 'most:period')
    }) : ({
      enabled: String(await utils.redis.hget(id, 'recent')).toLowerCase() === 'true',
      length: +(await utils.redis.hget(id, 'recent:length'))
    }));

app.get('', utils.ensureAuthenticated, async (req, res) => {
  const { id } = req.user;
  res.send({
    error: false,
    mostPlayed: await getCurrentSettings(id, true),
    recentlyAdded: await getCurrentSettings(id, false)
  });
});

app.post('/:type/toggle/', utils.ensureAuthenticated, async (req, res) => {
  const {
    user: { id },
    params: { type },
    body: { enable }
  } = req;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); }
  if (enable) await enablePlaylist(id, type);
  else await disablePlaylist(id, type);

  res.send(await getCurrentSettings(id, type === 'most'));
});

app.post('/:type/save', utils.ensureAuthenticated, async (req, res) => {
  const {
    user: { id },
    params: { type },
    body: { length, lastfm, period }
  } = req;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); return; }
  await saveSettings(id, length, lastfm, period, type === 'most');
  res.send(await getCurrentSettings(id, type === 'most'));
});

module.exports = app;