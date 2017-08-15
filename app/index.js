'use strict';

const
  express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  scribe = require('scribe-js')(),
  passport = require('passport'),
  RedisStore = require('connect-redis')(session),
  Redis = require('promise-redis')(),
  SpotifyStrategy = require('passport-spotify').Strategy;

const
  redis = Redis.createClient(),
  logger = process.console,
  app = express();

const
  config = require('./config'),
  RecentlyAdded = require('./recentlyAdded'),
  MostPlayed = require('./mostPlayed'),
  mostPlayed = new MostPlayed(redis),
  recentlyAdded = new RecentlyAdded(redis);

const
  ONE_SEC = 1000,
  ONE_MIN = 60 * ONE_SEC,
  ONE_HOUR = 60 * ONE_MIN;

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new SpotifyStrategy({
      clientID: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret,
      callbackURL: config.spotify.redirectUri
    },
    async(accessToken, refreshToken, profile, done) => {
      await saveToRedis({
        access: accessToken,
        refresh: refreshToken,
        userId: profile.id
      });
      profile.access = accessToken;
      profile.refresh = refreshToken;
      return done(null, profile);
    }
  )
);

logger.addLogger('backend', 'cyan');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(session({
  store: new RedisStore({ host: 'localhost', port: 6379, client: redis }),
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(scribe.express.logger(logger)); //Log each request
app.use('/logs', scribe.webPanel());
app.use(bodyParser.urlencoded({ extended: false }));

const ensureAuthenticated = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/');
const ensureAdmin = (req, res, next) => req.user.id === config.admin ? next() : res.redirect('/');

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('pages/loggedin', {
      user: req.user.username,
      userId: req.user.id,
      isAdmin: (req.user.id === config.admin)
    });
  } else {
    res.render('pages/loggedout');
  }
});

app.get('/login',
  passport.authenticate('spotify', {
    scope: config.spotify.scopes,
    showDialog: true
  })
);

app.get('/setup',
  passport.authenticate('spotify', { failureRedirect: '/error' }),
  (req, res) => res.redirect('/'));

app.get('/admin', ensureAuthenticated, ensureAdmin, (req, res) =>
  res.render('pages/admin'));

app.get('/forceRecent', ensureAuthenticated, ensureAdmin, (req, res) => {
  recentlyAdded.update();
  res.redirect('/');
});

app.get('/forceMost', ensureAuthenticated, ensureAdmin, (req, res) => {
  mostPlayed.update();
  res.redirect('/');
});

app.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/userplaylists', ensureAuthenticated, async(req, res) => {
  if (!req.isAuthenticated()) res.send({ error: true, errMsg: 'Not authenticated' });
  else {
    const userId = req.user.id,
      mostPlayedEnabled = String(await redis.hget(userId, 'most')).toLowerCase() === 'true',
      recentlyAddedEnabled = String(await redis.hget(userId, 'recent')).toLowerCase() === 'true';
    res.send({
      error: false,
      mostPlayed: mostPlayedEnabled,
      recentlyAdded: recentlyAddedEnabled
    });
  }
});

app.get('/settings', ensureAuthenticated, async(req, res) => {
  const userId = req.user.id,
    type = req.query.type;
  const { length, lastfm, period } = await getSettings(userId, type);
  res.render('pages/settings', {
    type,
    length: length || 25,
    lastfm: lastfm || '',
    period: period || '3month'
  });
});

app.get('/toggle', ensureAuthenticated, async(req, res) => {
  const userId = req.user.id,
    type = req.query.type;
  const enabled = String(await redis.hget(userId, type)).toLocaleLowerCase() === 'true';
  return enabled
    ? await disablePlaylist(userId, type, res) : await enablePlaylist(userId, type, res);
});

app.post('/save', ensureAuthenticated, async(req, res) => {
  const userId = req.user.id,
    { length: numTracks, lastfmId: lastfm = '', period = '', type } = req.body;
  await saveSettings(userId, numTracks, lastfm, period, type === 'most');
  res.redirect('/');
});

app.get('/goodbye', (req, res) => {
  res.render('pages/goodbye');
});

app.get('/delete', ensureAuthenticated, async(req, res) => {
  const userId = req.user.id;
  await redis.del(userId);
  await redis.srem('users', userId);
  req.logout();
  res.redirect('/goodbye');

});

app.get('*', (req, res) => {
  res.render('pages/error', {
    title: '404',
    errMsg: 'Whoops! Looks like that page got a little lost on its way to you'
  });
});

app.listen(5621, () => {
  logger.time().file().info('SpotifyApps listening on port 5621!');
});

const saveSettings = async(userId, numTracks, lastfm, period, isMost) => (isMost)
  ? redis.hmset(userId,
    'most', true,
    'most:length', numTracks,
    'most:playlist', 'null',
    'most:lastfm', lastfm,
    'most:period', period)
  : redis.hmset(userId,
    'recent', true,
    'recent:length', numTracks,
    'recent:playlist', 'null');

const getSettings = async(userId, type) => (type === 'most')
  ? ({
    length: await redis.hget(userId, `${type}:length`),
    lastfm: await redis.hget(userId, `${type}:lastfm`),
    period: await redis.hget(userId, `${type}:period`)
  })
  : ({
    length: await redis.hget(userId, `${type}:length`)
  });

const disablePlaylist = async(userId, type, res) => {
  res.send({ isSetup: true });
  return await redis.hset(userId, type, false);
};

const enablePlaylist = async(userId, type, res) => {
  const exists = await redis.hexists(userId, `${type}:playlist`);
  if (exists) {
    await redis.hset(userId, type, true);
    res.send({ isSetup: true });
  } else {
    await redis.hexists(userId, `${type}:playlist`);
    res.send({ isSetup: false });
  }
};

const saveToRedis = async data => {
  const exists = await redis.exists(data.userId);
  if (!exists) {
    await redis.sadd('users', data.userId);
    await redis.hmset(data.userId,
      'access', data.access,
      'refresh', data.refresh,
      'most', 'false',
      'recent', 'false');
  } else logger.time().file().info(`${data.userId} already added!`);
};

//run periodically
setInterval(() => recentlyAdded.update(), 5 * ONE_HOUR);
setTimeout(() => setInterval(() => mostPlayed.update(), 5 * ONE_HOUR), 2 * ONE_HOUR); //offset update

//run after starting
mostPlayed.update();
setTimeout(() => recentlyAdded.update(), ONE_MIN * 2);