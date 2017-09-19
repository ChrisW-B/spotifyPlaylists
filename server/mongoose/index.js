const Mongoose = require('mongoose');

Mongoose.connect('mongodb://localhost:27017/spotifyPlaylists', {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: 30
});

Mongoose.Promise = global.Promise;

module.exports = { Mongoose };