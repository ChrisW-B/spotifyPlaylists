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
	// Recent = require('./recentlyAdded'),
	// Most = require('./mostPlayed'),
	// mostPlayed = new Most(),
	// recentlyAdded = new Recent(),
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
		});
		profile.access = accessToken;
		profile.refresh = refreshToken;
		return done(null, profile);
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

app.get('/userplaylists', (req, res) => {
	if (!req.isAuthenticated()) res.send({
		error: true,
		errMsg: 'Not authenticated'
	});
	else {
		const userId = req.user.id;
		redis.connect()
			.then(() => {
				return Promise.all([
					redis.hget(userId, 'mostPlayed'),
					redis.hget(userId, 'recentlyAdded')
				]);
			})
			.then((playlists) => {
				const mostPlayed = playlists[0],
					recentlyAdded = playlists[1];
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
	res.render('pages/settings', {
		type: req.query.type,
		access: req.user.access,
		refresh: req.user.refresh
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

const saveToRedis = data => {
	redis.connect()
		.then(() => redis.exists(data.userId))
		.then(exists => {
			if (!exists) return redis.sadd('users', data.userId);
			else return new Promise((_, rej) => {
				rej('user already added');
			});
		})
		.then(() => redis.hmset(data.userId,
			'access', data.token,
			'refresh', data.refresh,
			'mostPlayed', 'false',
			'recentlyAdded', 'false'))
		.then(() => redis.close())
		.catch((err) => logger.time().file().error(err.message, err.stack));
};

const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
};

// //run periodically
// setInterval(recentlyAdded.start, 5 * ONE_HOUR);
// setTimeout(() => setInterval(mostPlayed.start, 5 * ONE_HOUR), 2 * ONE_HOUR); //offset start

// //run after start
// recentlyAdded.start();
// setTimeout(mostPlayed.start, 3 * ONE_MIN);
//