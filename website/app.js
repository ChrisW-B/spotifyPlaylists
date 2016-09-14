var SpotifyWebApi = require('spotify-web-api-node'),
	http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	config = require('./config'),
	scribe = require('scribe-js')(),
	console = process.console,
	app = express();
var lex = require('letsencrypt-express').create({
	// set to https://acme-v01.api.letsencrypt.org/directory in production
	server: 'https://acme-v01.api.letsencrypt.org/directory',
	challenges: {
		'http-01': require('le-challenge-fs').create({
			webrootPath: '/tmp/acme-challenges'
		})
	},
	store: require('le-store-certbot').create({
		webrootPath: '/tmp/acme-challenges'
	}),
	approveDomains: ['spotifyapps.chriswbarry.com'],
	email: 'me@chriswbarry.com',
	agreeTos: true,
	debug: true
});
require('http').createServer(lex.middleware(require('redirect-https')())).listen(5620, function() {
	console.log("Listening for ACME http-01 challenges on", this.address());
});
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
	var lastFmId = req.body.lastFmId,
		numTracks = req.body.numTracks,
		userAccessToken = req.body.token,
		userRefreshToken = req.body.refresh;
	config.recentlyAdded.spotifyApi.setAccessToken(userAccessToken);
	config.recentlyAdded.spotifyApi.setRefreshToken(userRefreshToken);
	config.recentlyAdded.spotifyApi.getMe().then(function(data) {
		jsonfile.readFile(config.recentlyAdded.fileLoc, function(err, obj) {
			if (notRegistered(obj, data.body.id)) {
				if (!err) {
					obj.push({
						userName: data.body.id,
						numTracks: numTracks,
						token: userAccessToken,
						refresh: userRefreshToken,
						oldPlaylist: "null"
					});
				} else {
					obj = [{
						userName: data.body.id,
						numTracks: numTracks,
						token: userAccessToken,
						refresh: userRefreshToken,
						oldPlaylist: "null"
					}];
				}
				jsonfile.writeFile(config.recentlyAdded.fileLoc, obj, function(err) {
					if (err) {
						console.log(err)
						res.redirect('/error');
					} else {
						res.redirect('/recentlyadded/thanks');
					}
				});
			} else {
				res.redirect('/recentlyadded/error');
			}
		});
	}, function(err) {
		console.log('Something went wrong in getMe!', err);
	});
});
app.post('/setup/mostplayed', function(req, res) {
	var lastFmId = req.body.lastFmId,
		timeSpan = req.body.timeSpan,
		numTracks = req.body.numTracks,
		userAccessToken = req.body.token,
		userRefreshToken = req.body.refresh;
	config.mostPlayed.spotifyApi.setAccessToken(userAccessToken);
	config.mostPlayed.spotifyApi.setRefreshToken(userRefreshToken);
	config.mostPlayed.spotifyApi.getMe().then(function(data) {
		jsonfile.readFile(config.mostPlayed.fileLoc, function(err, obj) {
			if (notRegistered(obj, data.body.id)) {
				if (!err) {
					obj.push({
						userName: data.body.id,
						lastFmId: escape(lastFmId),
						numTracks: numTracks,
						timeSpan: timeSpan,
						token: userAccessToken,
						refresh: userRefreshToken,
						oldPlaylist: "null"
					});
				} else {
					obj = [{
						userName: data.body.id,
						lastFmId: escape(lastFmId),
						numTracks: numTracks,
						timeSpan: timeSpan,
						token: userAccessToken,
						refresh: userRefreshToken,
						oldPlaylist: "null"
					}];
				}
				jsonfile.writeFile(config.mostPlayed.fileLoc, obj, function(err) {
					if (err) {
						console.log(err)
						res.redirect('/error');
					} else {
						res.redirect('/mostplayed/thanks');
					}
				});
			} else {
				res.redirect('/mostplayed/error');
			}
		});
	}, function(err) {
		console.log('Something went wrong in getMe!', err);
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
		config.recentlyAdded.spotifyApiUnsubscribe.getMe().then(function(data) {
			jsonfile.readFile(config.recentlyAdded.fileLoc, function(err, obj) {
				obj = removeFromList(obj, data.body.id);
				jsonfile.writeFile(config.recentlyAdded.fileLoc, obj, function(err) {
					if (err) {
						console.log(err)
						res.redirect('/error');
					} else {
						res.redirect('/recentlyadded/goodbye');
					}
				});
			});
		}, function(err) {
			console.log('Something went wrong in getMe!', err);
		});
	});
});
app.get('/stop/mostplayed/callback', function(req, res) {
	authorize(req.query.code, config.mostPlayed, true, function(data) {
		var userAccessToken = data.body.access_token,
			userRefreshToken = data.body.refresh_token,
			file = '../data/mostPlayed.json';
		config.mostPlayed.spotifyApiUnsubscribe.setAccessToken(userAccessToken);
		config.mostPlayed.spotifyApiUnsubscribe.setRefreshToken(userRefreshToken);
		config.mostPlayed.spotifyApiUnsubscribe.getMe().then(function(data) {
			jsonfile.readFile(config.mostPlayed.fileLoc, function(err, obj) {
				obj = removeFromList(obj, data.body.id);
				jsonfile.writeFile(config.mostPlayed.fileLoc, obj, function(err) {
					if (err) {
						console.log(err);
						res.redirect('/error');
					} else {
						res.redirect('/mostplayed/goodbye');
					}
				});
			});
		}, function(err) {
			console.log('Something went wrong in getMe!', err);
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
require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(5621, function() {
	console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});

function getCreds(type, unsub) {
	return (unsub) ? type.spotifyApiUnsubscribe.createAuthorizeURL(type.scopes) : type.spotifyApi.createAuthorizeURL(type.scopes);
};

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
};

function notRegistered(authInfo, userName) {
	var foundUsername = true;
	if (authInfo) {
		authInfo.forEach(function(ele, id) {
			if (ele.userName == userName) {
				foundUsername = false;
			}
		});
	}
	return foundUsername;
};

function removeFromList(array, userName) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].userName == userName) {
			console.log('removing');
			array.splice(i, 1);
			break;
		}
	}
	console.log(array);
	return array;
};