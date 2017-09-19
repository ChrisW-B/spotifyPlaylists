// server/app.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const expressWinston = require('express-winston');
const path = require('path');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const { spawn } = require('child_process');
const utils = require('./utils');
const { Mongoose } = require('../db');

const app = express();
const ONE_SEC = 1000;
const ONE_MIN = 60 * ONE_SEC;
const ONE_HOUR = 60 * ONE_MIN;

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  store: new MongoStore({ mongooseConnection: Mongoose.connection }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressWinston.logger({
  transports: [new winston.transports.Console({ colorize: true })],
  expressFormat: true,
  meta: false,
  colorize: true
}));
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.BUILD_MODE !== 'prebuilt') {
  /* eslint-disable import/no-extraneous-dependencies, global-require */
  // disable because we only want this in dev mode
  const webpackConfig = require('../webpack.dev.config.js');
  const compiler = require('webpack')(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    hot: true,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    },
    historyApiFallback: true
  }));
  app.use(require('webpack-hot-middleware')(compiler, {
    reload: true,
    path: '/__webpack_hmr',
    heartbeat: 10 * ONE_SEC
  }));
  /* eslint-enable import/no-extraneous-dependencies, global-require */
} else {
  app.get('*.js', (req, res, next) => {
    req.url += '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript');
    next();
  });

  app.get('/build/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/build', 'app.js'));
  });
}

app.use('/member', require('./routes/member'));
app.use('/admin', utils.ensureAuthenticated, utils.ensureAdmin, require('./routes/admin'));
app.use('/playlists', require('./routes/playlists'));

app.post('/postrecieve', utils.ensureGithub, (req, res) => {
  const cwd = path.join(__dirname, '..');
  const updateFile = path.join(cwd, 'scripts', 'update.sh');
  utils.logger.server(`running ${updateFile}`);
  spawn('sh', [updateFile], {
    cwd,
    env: Object.assign({}, process.env, { PATH: `${process.env.PATH} :/usr/local/bin` })
  });
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Thanks GitHub <3');
});

app.get('*', (req, res) => res.render('pages/index'));

// run periodically
setInterval(() => utils.recentlyAdded.update(), 5 * ONE_HOUR);
setTimeout(() =>
  setInterval(() => utils.mostPlayed.update(), 5 * ONE_HOUR), 2 * ONE_HOUR); // offset update

// run after starting
// utils.mostPlayed.update();
// setTimeout(() => utils.recentlyAdded.update(), ONE_MIN * 2);

module.exports = app;