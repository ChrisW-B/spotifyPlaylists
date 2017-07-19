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
  Recent = require('./recentlyAdded'),
  Most = require('./mostPlayed'),
  mostPlayed = new Most(redis),
  recentlyAdded = new Recent(redis);

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
    function (accessToken, refreshToken, profile, done) {
      saveToRedis({
        access: accessToken,
        refresh: refreshToken,
        userId: profile.id
      }).then(() => {
        profile.access = accessToken;
        profile.refresh = refreshToken;
        return done(null, profile);
      });
    }
  )
);

logger.addLogger('backend', 'cyan');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    client: redis
  }),
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: 'auto'
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(scribe.express.logger(logger)); //Log each request
app.use('/logs', scribe.webPanel());
app.use(bodyParser.urlencoded({
  extended: false
}));


const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

const ensureAdmin = (req, res, next) => {
  if (req.user.id === config.admin) {
    return next();
  }
  res.redirect('/');
};

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

app.get('/setup', passport.authenticate('spotify', {
  failureRedirect: '/error'
}), (req, res) => {
  res.redirect('/');
});

app.get('/admin', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('pages/admin');
});

app.get('/forceRecent', ensureAuthenticated, ensureAdmin, (req, res) => {
  recentlyAdded.start();
  res.redirect('/');
});

app.get('/forceMost', ensureAuthenticated, ensureAdmin, (req, res) => {
  mostPlayed.start();
  res.redirect('/');
});

app.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/userplaylists', ensureAuthenticated, (req, res) => {
  if (!req.isAuthenticated()) res.send({
    error: true,
    errMsg: 'Not authenticated'
  });
  else {
    const userId = req.user.id;
    Promise.all(
        [redis.hget(userId, 'most'), redis.hget(userId, 'recent')])
      .then((playlists) => {
        const mostPlayed = String(playlists[0]).toLowerCase() === 'true',
          recentlyAdded = String(playlists[1]).toLowerCase() === 'true'; //convert to boolean
        res.send({
          error: false,
          mostPlayed: mostPlayed,
          recentlyAdded: recentlyAdded
        });
      })
      .catch((err) => {
        res.send({
          error: true,
          errMsg: err.message
        });
        logger.time().file().warning(err.message, err.stack);
      });
  }
});

app.get('/settings', ensureAuthenticated, (req, res) => {
  const userId = req.user.id,
    type = req.query.type;
  getSettings(userId, type, type === 'most')
    .then((results) => {
      res.render('pages/settings', {
        type: results[0],
        length: results[1] || 25,
        lastfm: results[2] || '',
        period: results[3] || 'overall'
      });
    });
});

app.get('/toggle', ensureAuthenticated, (req, res) => {
  const userId = req.user.id,
    type = req.query.type;
  redis.hget(userId, type)
    .then(enabled => {
      enabled = String(enabled).toLowerCase() === 'true';
      if (enabled) {
        return disablePlaylist(userId, type, res);
      } else {
        return enablePlaylist(userId, type, res);
      }
    })
    .catch((err) => logger.file().time().warning(err.message, err.stack));
});

app.post('/save', ensureAuthenticated, (req, res) => {
  const numTracks = req.body.length,
    lastfm = req.body.lastfmId || '',
    period = req.body.period || '',
    type = req.body.type,
    userId = req.user.id;
  saveSettings(userId, numTracks, lastfm, period, type === 'most').then(() => {
    res.redirect('/');
  }).catch((err) => logger.file().time().warning(err.message, err.stack));
});

app.get('/goodbye', (req, res) => {
  res.render('pages/goodbye');
});

app.get('/delete', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  Promise.all([redis.del(userId), redis.srem('users', userId)])
    .then(() => {
      req.logout();
      res.redirect('/goodbye');
    }).catch((err) => {
      res.redirect('/error');
      logger.err(err.message, err.stack);
    });
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

const saveSettings = (userId, numTracks, lastfm, period, isMost) => {
  if (isMost) {
    return redis.hmset(userId,
      'most', true,
      'most:length', numTracks,
      'most:playlist', 'null',
      'most:lastfm', lastfm,
      'most:period', period);
  } else {
    return redis.hmset(userId,
      'recent', true,
      'recent:length', numTracks,
      'recent:playlist', 'null');
  }
};

const getSettings = (userId, type, isMost) => {
  if (isMost) {
    return Promise.all([new Promise(resolve => resolve(type)),
      redis.hget(userId, `${type}:length`),
      redis.hget(userId, `${type}:lastfm`),
      redis.hget(userId, `${type}:period`)
    ]);
  } else {
    return Promise.all([new Promise(resolve => resolve(type)),
      redis.hget(userId, `${type}:length`)
    ]);
  }
};

const disablePlaylist = (userId, type, res) => {
  res.send({
    isSetup: true
  });
  return redis.hset(userId, type, false);
};

const enablePlaylist = (userId, type, res) => {
  return redis.hexists(userId, `${type}:playlist`).then(exists => {
    if (exists) {
      res.send({
        isSetup: true
      });
      return redis.hset(userId, type, true);
    } else {
      res.send({
        isSetup: false
      });
      return redis.hexists(userId, `${type}:playlist`);
    }
  });
};

const saveToRedis = data => {
  return redis.exists(data.userId)
    .then(exists => {
      if (!exists) return redis.sadd('users', data.userId);
      else return new Promise((_, rej) => {
        rej('user already added');
      });
    })
    .then(() => redis.hmset(data.userId,
      'access', data.access,
      'refresh', data.refresh,
      'most', 'false',
      'recent', 'false'))
    .catch((err) => {
      logger.time().file().warning(`${err} \n ${err.stack}`);
    });
};

//run periodically
setInterval(recentlyAdded.start, 5 * ONE_HOUR);
setTimeout(() => setInterval(mostPlayed.start, 5 * ONE_HOUR), 2 * ONE_HOUR); //offset start

//run after start
recentlyAdded.start();
setTimeout(mostPlayed.start, 3 * ONE_MIN);