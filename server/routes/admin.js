// server/routes/admin.js

const express = require('express'),
  app = express.Router(),
  utils = require('../utils');

app.get('/forceRecent', utils.ensureAuthenticated, utils.ensureAdmin, (req, res) => {
  utils.recentlyAdded.update();
  res.json({ success: true });
});
app.get('/forceMost', utils.ensureAuthenticated, utils.ensureAdmin, (req, res) => {
  utils.mostPlayed.update();
  res.json({ success: true });
});

module.exports = app;