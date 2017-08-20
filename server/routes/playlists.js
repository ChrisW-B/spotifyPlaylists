const express = require('express'),
  app = express.Router(),
  utils = require('../utils');

app.get('/playlists', utils.ensureAuthenticated, async(req, res) => {
  if (!req.isAuthenticated()) res.send({ error: true, errMsg: 'Not authenticated' });
  else {
    const userId = req.user.id,
      mostPlayedEnabled = String(await utils.redis.hget(userId, 'most')).toLowerCase() === 'true',
      recentlyAddedEnabled = String(await utils.redis.hget(userId, 'recent')).toLowerCase() === 'true';
    res.send({
      error: false,
      mostPlayed: mostPlayedEnabled,
      recentlyAdded: recentlyAddedEnabled
    });
  }
});
app.get('/playlist/:type/toggle/', utils.ensureAuthenticated, async(req, res) => {
  const userId = req.user.id,
    type = req.params.type;
  const enabled = String(await utils.redis.hget(userId, type)).toLocaleLowerCase() === 'true';
  return enabled
    ? await disablePlaylist(userId, type, res) : await enablePlaylist(userId, type, res);
});
app.post('/playlist/:type/save', utils.ensureAuthenticated, async(req, res) => {
  const userId = req.params.id,
    { length: numTracks, lastfmId: lastfm = '', period = '', type } = req.body;
  await saveSettings(userId, numTracks, lastfm, period, type === 'most');
});

const disablePlaylist = async(userId, type, res) => {
    res.send({ isSetup: true });
    return await utils.redis.hset(userId, type, false);
  },
  enablePlaylist = async(userId, type, res) => {
    const exists = await utils.redis.hexists(userId, `${type}:playlist`);
    if (exists) {
      await utils.redis.hset(userId, type, true);
      res.send({ isSetup: true });
    } else {
      await utils.redis.hexists(userId, `${type}:playlist`);
      res.send({ isSetup: false });
    }
  };

const saveSettings = async(userId, numTracks, lastfm, period, isMost) => (isMost)
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