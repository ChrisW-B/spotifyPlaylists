var SpotifyWebApi = require('spotify-web-api-node'),
	http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	util = require('util'),
	config = require('./config'),
	scribe = require('scribe-js')(),
	Redis = require('redisng'),
	redis = new Redis(),
	console = process.console,
	app = express();
config.recentlyAdded.spotifyApi = new SpotifyWebApi({
	clientId: config.recentlyAdded.clientId,
	clientSecret: config.recentlyAdded.clientSecret,
	redirectUri: config.recentlyAdded.redirectUri
});
config.mostPlayed.spotifyApi = new SpotifyWebApi({
	clientId: config.mostPlayed.clientId,
	clientSecret: config.mostPlayed.clientSecret,
	redirectUri: config.mostPlayed.redirectUri
});
config.recentlyAdded.spotifyApiUnsubscribe = new SpotifyWebApi({
	clientId: config.recentlyAdded.clientId,
	clientSecret: config.recentlyAdded.clientSecret,
	redirectUri: config.recentlyAdded.cancelUri
});
config.mostPlayed.spotifyApiUnsubscribe = new SpotifyWebApi({
	clientId: config.mostPlayed.clientId,
	clientSecret: config.mostPlayed.clientSecret,
	redirectUri: config.mostPlayed.cancelUri
});
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.use(scribe.express.logger(console)); //Log each request
app.use('/logs', scribe.webPanel());
app.get('/', function(req, res) {
	res.render('pages/index');
});
app.get('/create/mostplayed', function(req, res) {
	res.render('pages/signin', {
		loginUrl: getCreds(config.mostPlayed, false),
		visitType: "This will let us create and update a playlist on your spotify account."
	});
});
app.get('/create/recentlyadded', function(req, res) {
	res.render('pages/signin', {
		loginUrl: getCreds(config.recentlyAdded, false),
		visitType: "This will let us create and update a playlist on your spotify account."
	});
});
app.get('/stop', function(req, res) {
	res.render('pages/stop');
});
app.get('/setup/mostplayed', function(req, res) {
	authorize(req.query.code, config.mostPlayed, false, function(data) {
		res.render('pages/mostplayed', {
			access: data.body.access_token,
			refresh: data.body.refresh_token
		});
	});
});
app.get('/setup/recentlyadded', function(req, res) {
	authorize(req.query.code, config.recentlyAdded, false, function(data) {
		res.render('pages/recentlyadded', {
			access: data.body.access_token,
			refresh: data.body.refresh_token
		});
	});
});
app.post('/setup/recentlyadded', function(req, res) {
	var userId = "",
		lastFmId = req.body.lastFmId,
		numTracks = req.body.numTracks,
		userAccessToken = req.body.token,
		userRefreshToken = req.body.refresh;
	config.recentlyAdded.spotifyApi.setAccessToken(userAccessToken);
	config.recentlyAdded.spotifyApi.setRefreshToken(userRefreshToken);
	Promise.all([config.recentlyAdded.spotifyApi.getMe(), redis.connect()]).then(data => {
		userId = data[0].body.id;
		return redis.exists('recent:' + userId);
	}).then((exists) => {
		if (!exists) return redis.sadd('users', "recent:" + userId)
		else return new Promise((_, rej) => {
			rej('user already added');
		});
	}).then(() => {
		return redis.hmset("recent:" + userId,
			"numTracks", numTracks,
			"token", userAccessToken,
			"refresh", userRefreshToken,
			"oldPlaylist", "null");
	}).then((success) => {
		if (success) {
			res.redirect('/recentlyadded/thanks');
			redis.close();
		} else {
			new Promise((_, rej) => {
				rej('error adding info');
			});
		}
	}).catch((err) => {
		res.redirect('/recentlyadded/error');
		console.log(err.message, err.stack);
		redis.close();
	});
});

app.post('/setup/mostplayed', function(req, res) {
	var userId = "",
		lastFmId = req.body.lastFmId,
		timeSpan = req.body.timeSpan,
		numTracks = req.body.numTracks,
		userAccessToken = req.body.token,
		userRefreshToken = req.body.refresh;
	config.mostPlayed.spotifyApi.setAccessToken(userAccessToken);
	config.mostPlayed.spotifyApi.setRefreshToken(userRefreshToken);
	Promise.all([config.mostPlayed.spotifyApi.getMe(), redis.connect()]).then(data => {
		userId = data[0].body.id;
		return redis.exists('most:' + userId);
	}).then((exists) => {
		if (!exists) return redis.sadd('users', "most:" + userId)
		else return new Promise((_, rej) => {
			rej('user already added');
		});
	}).then(() => {
		return redis.hmset("most:" + userId,
			"lastFmId", escape(lastFmId),
			"numTracks", numTracks,
			"token", userAccessToken,
			"refresh", userRefreshToken,
			"timespan", timespan,
			"oldPlaylist", "null");
	}).then((success) => {
		if (success) {
			res.redirect('/mostplayed/thanks');
			redis.close();
		} else {
			new Promise((_, rej) => {
				rej('error adding info');
			});
		}
	}).catch((err) => {
		res.redirect('/mostplayed/error');
		console.log(err.message, err.stack);
		redis.close();
	});
});

app.get('/error', function(req, res) {
	res.render('pages/error');
});
app.get('/mostplayed/error', function(req, res) {
	res.render('pages/alreadysignedup', {
		type: "most played"
	});
});
app.get('/recentlyadded/error', function(req, res) {
	res.render('pages/alreadysignedup', {
		type: "recently added"
	});
});
app.get('/stop/mostplayed', function(req, res) {
	res.render('pages/signin', {
		loginUrl: getCreds(config.mostPlayed, true),
		visitType: "One last sign in so we know which account to remove."
	});
});
app.get('/stop/recentlyadded', function(req, res) {
	res.render('pages/signin', {
		loginUrl: getCreds(config.recentlyAdded, true),
		visitType: "One last sign in so we know which account to remove."
	});
});
app.get('/stop/recentlyadded/callback', function(req, res) {
	authorize(req.query.code, config.recentlyAdded, true, function(data) {
		var userAccessToken = data.body.access_token,
			userRefreshToken = data.body.refresh_token;
		config.recentlyAdded.spotifyApiUnsubscribe.setAccessToken(userAccessToken);
		config.recentlyAdded.spotifyApiUnsubscribe.setRefreshToken(userRefreshToken);
		Promise.all([config.mostPlayed.spotifyApiUnsubscribe.getMe(), redis.connect()]).then(data => {
			var userId = data[0].body.id;
			return Promise.all([redis.del("recent:" + userId), redis.srem("users", "recent:" + userId)]);
		}).then(() => {
			res.redirect('/recentlyadded/goodbye');
			redis.close();
		}).catch((err) => {
			res.redirect('/error');
			redis.close();
			console.log(err.message, err.stack);
		});
	});
});
app.get('/stop/mostplayed/callback', function(req, res) {
	authorize(req.query.code, config.mostPlayed, true, function(data) {
		var userAccessToken = data.body.access_token,
			userRefreshToken = data.body.refresh_token;
		config.mostPlayed.spotifyApiUnsubscribe.setAccessToken(userAccessToken);
		config.mostPlayed.spotifyApiUnsubscribe.setRefreshToken(userRefreshToken);
		Promise.all([config.mostPlayed.spotifyApiUnsubscribe.getMe(), redis.connect()]).then(data => {
			var userId = data[0].body.id;
			return Promise.all([redis.del("most:" + userId), redis.srem("users", "most:" + userId)]);
		}).then(() => {
			res.redirect('/mostplayed/goodbye');
			redis.close();
		}).catch((err) => {
			res.redirect('/error');
			redis.close();
			console.log(err.message, err.stack);
		});
	});
});
app.get('/recentlyadded/goodbye', function(req, res) {
	res.render('pages/goodbye', {
		type: 'recently added'
	});
});
app.get('/mostplayed/goodbye', function(req, res) {
	res.render('pages/goodbye', {
		type: 'most played'
	});
});
app.get('/mostplayed/thanks', function(req, res) {
	res.render('pages/thanks', {
		type: 'most played'
	});
});
app.get('/recentlyadded/thanks', function(req, res) {
	res.render('pages/thanks', {
		type: 'recently added'
	});
});
app.listen(5621, function() {
	console.log('SpotifyApps listening on port 5621!');
});

function getCreds(type, unsub) {
	return (unsub) ? type.spotifyApiUnsubscribe.createAuthorizeURL(type.scopes) : type.spotifyApi.createAuthorizeURL(type.scopes);
}

function authorize(code, type, unsub, callback) {
	if (!unsub) {
		type.spotifyApi.authorizationCodeGrant(code).then(function(data) {
			callback(data);
		}, function(err) {
			console.log('Something went wrong! in auth', err);
		});
	} else {
		type.spotifyApiUnsubscribe.authorizationCodeGrant(code).then(function(data) {
			callback(data);
		}, function(err) {
			console.log('Something went wrong! in auth', err);
		});
	}
}