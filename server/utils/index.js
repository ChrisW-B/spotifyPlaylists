// server/utils/index.js
require('dotenv').config();
const Redis = require('promise-redis')();
const winston = require('winston');
const crypto = require('crypto');
const RecentlyAdded = require('../Playlists').recentlyAdded;
const MostPlayed = require('../Playlists').mostPlayed;

const redis = Redis.createClient();
const logger = new (winston.Logger)({
  level: 'recentlyAdded',
  levels: { server: 0, playlist: 0, mostPlayed: 0, recentlyAdded: 0 },
  colors: { server: 'green', playlist: 'blue', mostPlayed: 'magenta', recentlyAdded: 'yellow' },
  colorize: true,
  transports: [
    new (winston.transports.Console)({ timestamp: true, prettyPrint: true, colorize: true })
  ]
});

const mostPlayed = new MostPlayed(logger,
  redis, {
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT
  }, {
    apiKey: process.env.LASTFM_TOKEN,
    apiSecret: process.env.LASTFM_SECRET,
    username: process.env.LASTFM_USERNAME,
    password: process.env.LASTFM_PASS
  });
const recentlyAdded = new RecentlyAdded(
  logger,
  redis, {
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT
  });

module.exports = {
  logger,
  redis,
  recentlyAdded,
  mostPlayed,

  ensureAuthenticated: (req, res, next) =>
    (req.isAuthenticated() ? next() : res.sendStatus(401)),
  ensureAdmin: (req, res, next) =>
    (req.user.id === process.env.ADMIN ? next() : res.sendStatus(403)),
  ensureGithub: (req, res, next) => {
    if (!req.headers['user-agent'].includes('GitHub-Hookshot')) res.redirect(301, '/');
    const hmac = crypto.createHmac('sha1', process.env.GITHUB_SECRET);
    if (crypto.timingSafeEqual(Buffer.from(`sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`, 'utf8'), Buffer.from(req.get('X-Hub-Signature'), 'utf8'))) return next();
    return res.redirect(301, '/');
  }

};