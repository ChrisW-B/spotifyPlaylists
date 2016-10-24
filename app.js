'use strict';

const express = require('express'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	config = require('./config'),
	scribe = require('scribe-js')(),
	Redis = require('redisng'),
	passport = require('passport'),
	SpotifyStrategy = require('Passport-Spotify').Strategy,
	redis = new Redis(),
	logger = process.console,
	Recent = require('./recentlyAdded'),
	Most = require('./mostPlayed'),
	mostPlayed = new Most(),
	recentlyAdded = new Recent(),
	app = express();

const ONE_SEC = 1000,
	ONE_MIN = 60 * ONE_SEC,
	ONE_HOUR = 60 * ONE_MIN;

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
passport.use(new SpotifyStrategy({
		clientID: config.spotify.clientId,
		clientSecret: config.spotify.clientSecret,
		callbackURL: config.spotify.redirectUri
	},
	function(accessToken, refreshToken, profile, done) {
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
));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
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

app.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		res.render('pages/loggedin', {
			user: req.user.displayName,
			userId: req.user.id
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
	passport.authenticate('spotify', {
		failureRedirect: '/error'
	}),
	(req, res) => {
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
		redis.connect()
			.then(() => {
				return Promise.all([
					redis.hget(userId, 'most'),
					redis.hget(userId, 'recent')
				]);
			})
			.then((playlists) => {
				const mostPlayed = String(playlists[0]).toLowerCase() === 'true',
					recentlyAdded = String(playlists[1]).toLowerCase() === 'true'; //convert to boolean
				res.send({
					error: false,
					mostPlayed: mostPlayed,
					recentlyAdded: recentlyAdded
				});
				redis.close();
			})
			.catch((err) => {
				res.send({
					error: true,
					errMsg: err.message
				});
				redis.close();
				logger.time().file().error(err.message, err.stack);
			});
	}
});

app.get('/settings', ensureAuthenticated, (req, res) => {
	const userId = req.user.id,
		type = req.query.type;
	redis.connect().then(() => {
		if (type === 'most') {
			return Promise.all([new Promise(resolve => resolve(type)),
				redis.hget(userId, type + ':length'),
				redis.hget(userId, type + ':lastfm'),
				redis.hget(userId, type + ':period')
			]);
		} else {
			return Promise.all([new Promise(resolve => resolve(type)),
				redis.hget(userId, type + ':length')
			]);
		}
	}).then((results) => {
		res.render('pages/settings', {
			type: results[0],
			length: results[1],
			lastfm: results[2],
			period: results[3]
		});
		redis.close();
	});
});

app.get('/toggle', ensureAuthenticated, (req, res) => {
	const userId = req.user.id,
		type = req.query.type;
	redis.connect()
		.then(() => redis.hget(userId, type))
		.then(enabled => {
			enabled = String(enabled).toLowerCase() === 'true';
			if (enabled) {
				return disablePlaylist(userId, type, res);
			} else {
				return enablePlaylist(userId, type, res);
			}
		})
		.then(() => redis.close())
		.catch((err) => logger.file().time().error(err.message, err.stack));
});

app.post('/save', ensureAuthenticated, (req, res) => {
	const numTracks = req.body.length,
		lastfm = req.body.lastfmId || '',
		period = req.body.period || '',
		type = req.body.type,
		userId = req.user.id;
	redis.connect().then(() => {
		if (type === 'recent') {
			return redis.hmset(userId,
				'recent', true,
				'recent:length', numTracks,
				'recent:playlist', 'null');
		} else {
			return redis.hmset(userId,
				'most', true,
				'most:length', numTracks,
				'most:playlist', 'null',
				'most:lastfm', lastfm,
				'most:period', period);
		}
	}).then(() => {
		res.redirect('/');
		redis.close();
	}).catch((err) => logger.file().time().error(err.message, err.stack));
});

app.get('/goodbye', (req, res) => {
	res.render('pages/goodbye');
});

app.get('/delete', ensureAuthenticated, (req, res) => {
	const userId = req.user.id;
	redis.connect().then(() => {
		return Promise.all([redis.del(userId), redis.srem('users', userId)]);
	}).then(() => {
		req.logout();
		res.redirect('/goodbye');
		redis.close();
	}).catch((err) => {
		res.redirect('/error');
		redis.close();
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

const disablePlaylist = (userId, type, res) => {
	res.send({
		isSetup: true
	});
	return redis.hset(userId, type, false);
};

const enablePlaylist = (userId, type, res) => {
	return redis.hexists(userId, type + ':playlist').then(exists => {
		if (exists) {
			res.send({
				isSetup: true
			});
			return redis.hset(userId, type, true);
		} else {
			res.send({
				isSetup: false
			});
			return redis.hexists(userId, type + ':playlist');
		}
	});
};

const saveToRedis = data => {
	return redis.connect()
		.then(() => redis.exists(data.userId))
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
		.then(() => {
			return redis.close();
		})
		.catch((err) => {
			redis.close();
			logger.time().file().error(err, err.stack);
		});
};

//run periodically
setInterval(recentlyAdded.start, 5 * ONE_HOUR);
setTimeout(() => setInterval(mostPlayed.start, 5 * ONE_HOUR), 2 * ONE_HOUR); //offset start

//run after start
recentlyAdded.start();
setTimeout(mostPlayed.start, 3 * ONE_MIN);