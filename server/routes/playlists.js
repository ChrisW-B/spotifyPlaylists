const express = require('express'),
  app = express.Router(),
  utils = require('../utils');

app.get('', utils.ensureAuthenticated, async(req, res) => {
  const userId = req.user.id,
    mostPlayed = {
      enabled: String(await utils.redis.hget(userId, 'most')).toLowerCase() === 'true',
      length: await utils.redis.hget(userId, 'most:length'),
      lastfm: await utils.redis.hget(userId, 'most:lastfm'),
      period: await utils.redis.hget(userId, 'most:period')
    },
    recentlyAdded = {
      enabled: String(await utils.redis.hget(userId, 'recent')).toLowerCase() === 'true',
      length: await utils.redis.hget(userId, 'recent:length')
    };
  res.send({
    error: false,
    mostPlayed,
    recentlyAdded
  });
});

app.post('/:type/toggle/', utils.ensureAuthenticated, async(req, res) => {
  const userId = req.user.id,
    type = req.params.type,
    enable = req.body.enable;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); }
  if (enable) await enablePlaylist(userId, type);
  else await disablePlaylist(userId, type);
  const response = type === 'most'
    ? {
      enabled: String(await utils.redis.hget(userId, 'most')).toLowerCase() === 'true',
      length: await utils.redis.hget(userId, 'most:length'),
      lastfm: await utils.redis.hget(userId, 'most:lastfm'),
      period: await utils.redis.hget(userId, 'most:period')
    } : {
      enabled: String(await utils.redis.hget(userId, 'recent')).toLowerCase() === 'true',
      length: await utils.redis.hget(userId, 'recent:length')
    };
  res.send(response);
});

app.post('/:type/save', utils.ensureAuthenticated, async(req, res) => {
  const userId = req.params.id,
    { length: numTracks, lastfmId: lastfm = '', period = '', type } = req.body;
  if (type !== 'most' && type !== 'recent') { res.sendStatus(401); return; }
  await saveSettings(userId, numTracks, lastfm, period, type === 'most');
});

const disablePlaylist = async(userId, type) => await utils.redis.hset(userId, type, false),
  enablePlaylist = async(userId, type) => await utils.redis.hset(userId, type, true),

  saveSettings = async(userId, numTracks, lastfm, period, isMost) => (isMost)
  ? utils.redis.hmset(userId,
    'most', true,
    'most:length', numTracks,
    'most:playlist', 'null',
    'most:lastfm', lastfm,
    'most:period', period)
  : utils.redis.hmset(userId,
    'recent', true,
    'recent:length', numTracks,
    'recent:playlist', 'null');

module.exports = app;