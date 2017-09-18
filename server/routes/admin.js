// server/routes/admin.js

const express = require('express');
const utils = require('../utils');

const app = express.Router();

app.post('/forceRecent', (req, res) => {
  utils.recentlyAdded.update();
  res.json({ success: true });
});

app.post('/forceMost', (req, res) => {
  utils.mostPlayed.update();
  res.json({ success: true });
});

module.exports = app;