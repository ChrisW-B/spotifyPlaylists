const express = require('express'),
  app = express.Router(),
  utils = require('../utils');

app.get('/forceRecent', utils.ensureAuthenticated, utils.ensureAdmin, (req, res) => utils.recentlyAdded.update());
app.get('/forceMost', utils.ensureAuthenticated, utils.ensureAdmin, (req, res) => utils.mostPlayed.update());

module.exports = app;