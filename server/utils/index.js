const Redis = require('promise-redis')(),
  redis = Redis.createClient(),
  winston = require('winston'),

  config = require('../config'),
  RecentlyAdded = require('../Playlists').recentlyAdded,
  MostPlayed = require('../Playlists').mostPlayed,

  logger = new(winston.Logger)({
    level: 'recentlyAdded',
    levels: { server: 0, playlist: 0, mostPlayed: 0, recentlyAdded: 0 },
    colors: { server: 'green', playlist: 'blue', mostPlayed: 'magenta', recentlyAdded: 'yellow' },
    colorize: true,
    transports: [
      new(winston.transports.Console)({ 'timestamp': true, 'prettyPrint': true, colorize: true })
    ]
  }),

  mostPlayed = new MostPlayed(logger,
    redis, {
      clientId: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret,
      redirectUri: config.spotify.redirectUri
    }, {
      apiKey: config.lastfm.token,
      apiSecret: config.lastfm.secret,
      username: config.lastfm.username,
      password: config.lastfm.password
    }),
  recentlyAdded = new RecentlyAdded(
    logger,
    redis, {
      clientId: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret,
      redirectUri: config.spotify.redirectUri
    });

module.exports = {
  logger,
  config,
  redis,
  recentlyAdded,
  mostPlayed,

  ensureAuthenticated: (req, res, next) => req.isAuthenticated() ? next() : res.sendStatus(404),
  ensureAdmin: (req, res, next) => req.user.id === config.admin ? next() : res.sendStatus(404),


  getSettings: async(userId, type) => (type === 'most')
    ? ({
      length: await redis.hget(userId, `${type}:length`),
      lastfm: await redis.hget(userId, `${type}:lastfm`),
      period: await redis.hget(userId, `${type}:period`)
    })
    : ({
      length: await redis.hget(userId, `${type}:length`)
    })


};