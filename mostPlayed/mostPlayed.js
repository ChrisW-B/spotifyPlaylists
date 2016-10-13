var Lastfm = require('lastfm-njs'),
	SpotifyWebApi = require('spotify-web-api-node'),
	util = require('util'),
	sleep = require('sleep-promise'),
	config = require('./config'),
	Redis = require('redisng'),
	redis = new Redis(),
	scribe = require('scribe-js')({
		createDefaultlog: false
	}),
	console = process.console,
	logger = scribe.console({
		logWriter: {
			rootPath: '../website/logs'
		}
	}),
	lastfm = new Lastfm({
		apiKey: config.lastfm.token,
		apiSecret: config.lastfm.secret,
		username: config.lastfm.username,
		password: config.lastfm.password
	}),
	spotifyApi = new SpotifyWebApi({
		clientId: config.spotify.token,
		clientSecret: config.spotify.secret,
		redirectUri: config.spotify.redirectUri
	});
const ONE_SEC = 1000,
	ONE_MIN = 60 * ONE_SEC;

function convertToSpotify(topTracks) {
	// takes list of last.fm tracks and tries to find them in spotify
	return Promise.all(topTracks.map((ele, id) => {
		return new Promise((resolve) => {
			sleep(ONE_SEC * id)
				.then(() => {
					logger.time().file().info(`Searching for ${ele.name} by ${ele.artist.name}`);
					return spotifyApi.searchTracks(`track:${ele.name} artist:${ele.artist.name}`)
				})
				.then((spotifyData) => {
					var results = spotifyData.body.tracks.items;
					if (results.length > 0 && results[0].uri) {
						resolve({
							id: results[0].uri,
							rank: ele['@attr'].rank
						});
					} else {
						logger.time().file().err(`couldn't find ${ele.name} by ${ele.artist.name}`);
						resolve(undefined);
					}
				}).catch(err => {
					logger.time().file().err(`${err} \n\n ${err.stack} \ncouldn't find ${ele.name} by ${ele.artist.name}`);
					resolve(undefined);
				});
		})
	}))
}


function fillPlaylist(userId, playlistId, tracklist) {
	//add list of spotify tracks to a playlist
	var trackArray = [];
	for (var i = 0; i < tracklist.length; i++) {
		trackArray.push(tracklist[i].id);
	}
	return spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray);
}

function clearExistingPlaylist(userId, playlist) {
	// create an empty playlist
	return new Promise((resolve, _) => {
		if (playlist.tracks.total > 0) {
			var numsToDelete = [];
			for (var j = 0; j < playlist.tracks.total; j++) {
				numsToDelete.push(j);
			}
			spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, numsToDelete, playlist.snapshot_id).then(() =>
				resolve(playlist.id)
			).catch((err) => {
				reject(err);
			});
		}
	});
}

function foundOldPlaylist(playlists, oldPlaylist) {
	//try to find old playlist, return index if you do
	for (var i = 0; i < playlists.length; i++) {
		if (playlists[i].id === oldPlaylist) {
			return i;
		}
	}
	return -1;
}

function createNewPlaylist(userId) {
	return new Promise((resolve, reject) => {
		return spotifyApi.createPlaylist(userId, 'Most Played', {
			'public': false
		}).then(playlist => {
			resolve(playlist.body.id);
		}).catch(err => {
			reject(err);
		})
	});
}

function preparePlaylist(userId, oldPlaylistId, offset = 0) {
	return new Promise((resolve) => {
		spotifyApi.getUserPlaylists(userId, {
			limit: 20,
			offset: offset
		}).then(playlists => {
			var playlistLoc = foundOldPlaylist(playlists.body.items, oldPlaylistId);
			if (playlistLoc > -1) {
				resolve(clearExistingPlaylist(userId, playlists.body.items[playlistLoc]));
			} else if (playlists.body.next == null) {
				resolve(createNewPlaylist(userId));
			} else {
				resolve(preparePlaylist(userId, oldPlaylistId, offset + 20));
			}
		})
	});
}

function insertMissingTracks(trackList, lastFmId, period) {
	var nextTrackSet;
	return Promise.all(trackList.map((ele) => {
		if (ele !== undefined) {
			return new Promise(resolve => {
				resolve(ele);
			});
		} else {
			if (nextTrackSet === undefined) {
				return lastfm.user_getTopTracks({
					user: lastfmId,
					limit: tracklist.length,
					period: period,
					page: 2
				}).then(lastFmTrackList => {
					var tracks = lastFmTrackList.track;
					return convertToSpotify(tracks);
				}).then(spotifyList => {
					nextTrackSet = spotifyList;
					for (var i = 0; i < nextTrackSet.length; i++) {
						var temp = nextTrackSet[i];
						nextTrackSet[i] = undefined;
						if (temp !== undefined) {
							return new Promise(resolve => {
								resolve(temp);
							});
						}
					}
				})
			} else {
				for (var i = 0; i < nextTrackSet.length; i++) {
					var temp = nextTrackSet[i];
					nextTrackSet[i] = undefined;
					if (temp !== undefined) {
						return new Promise(resolve => {
							resolve(temp);
						});
					}
				}
			}
		}
	}));
}

function refreshToken(access, refresh) {
	//gets refresh token
	spotifyApi.setAccessToken(access);
	spotifyApi.setRefreshToken(refresh);
	return spotifyApi.refreshAccessToken();
};

function sortSpotifyTracks(tracks) {
	return new Promise((resolve, reject) => {
		tracks.sort(function(a, b) {
			return a.rank - b.rank;
		});
		resolve(tracks);
	});
}

function updatePlaylist(userId, delayInc) {
	var newTokens = {},
		ele = {};
	logger.time().file().info('Getting database items');
	return sleep(delayInc * ONE_MIN * 5).then(() => Promise.all([
		redis.hget(userId, 'numTracks'),
		redis.hget(userId, 'refresh'),
		redis.hget(userId, 'token'),
		redis.hget(userId, 'oldPlaylist'),
		redis.hget(userId, 'lastFmId'),
		redis.hget(userId, 'timespan')
	])).then(data => {
		ele.numTracks = data[0];
		ele.refresh = data[1];
		ele.token = data[2];
		ele.oldPlaylist = data[3];
		ele.lastFmId = data[4];
		ele.timespan = data[5];
		logger.time().file().info('Logging in to spotify');
		return refreshToken(ele.token, ele.refresh)
	}).then(data => {
		newTokens.token = data.body.access_token;
		newTokens.refresh = data.body.refresh_token ? data.body.refresh_token : ele.refresh;
		spotifyApi.setAccessToken(newTokens.token);
		spotifyApi.setRefreshToken(newTokens.refresh);
		logger.time().file().info('logging in to lastfm');
		return lastfm.auth_getMobileSession();
	}).then(() => {
		logger.time().file().info('getting last.fm top tracks');
		return lastfm.user_getTopTracks({
			user: ele.lastfmId,
			limit: Number(ele.numTracks),
			period: ele.timespan
		});
	}).then(lastFmTrackList => {
		logger.time().file().info('converting to spotify and getting userinfo');
		return convertToSpotify(lastFmTrackList.track, ele.numTracks);
	}).then((spotifyList) => {
		return Promise.all([
			spotifyApi.getMe(),
			insertMissingTracks(spotifyList, ele.lastFmId, ele.timeSpan)
		]);
	}).then(values => {
		logger.time().file().info('sorting tracks, getting user, and preparing playlist');
		var spotifyId = values[0].body.id,
			convertedList = values[1];
		return Promise.all([
			new Promise(resolve => {
				resolve(spotifyId)
			}),
			preparePlaylist(spotifyId, ele.oldPlaylist),
			sortSpotifyTracks(convertedList)
		]);
	}).then(values => {
		logger.time().file().info('filling playlist');
		var userId = values[0],
			newPlaylistId = values[1],
			sortedTracks = values[2];
		return Promise.all([
			new Promise(resolve => {
				resolve(newPlaylistId)
			}),
			fillPlaylist(userId, newPlaylistId, sortedTracks)
		]);
	}).then((values) => {
		var newPlaylistId = values[0];
		return Promise.all([
			redis.hset(userId, 'token', newTokens.token),
			redis.hset(userId, 'refresh', newTokens.refresh),
			redis.hset(userId, 'oldPlaylist', newPlaylistId)
		]);
	}).catch(err => {
		logger.time().file().error(err);
		logger.time().file().error(err.stack);
		//try again in a few minutes
		setTimeout(() => {
			updatePlaylist(ele, id, obj);
		}, 5 * ONE_MIN);
	});
}

(() => {
	logger.time().file().tag('main').info('Starting');
	redis.connect().then(() => redis.smembers('users'))
		.then(users => {
			var promises = [];
			var delayInc = 0;
			users.forEach((userId) => {
				if (userId.includes('most')) {
					logger.time().file().info('updating', userId);
					promises.push(updatePlaylist(userId, delayInc));
					delayInc++;
				}
			});
			return Promise.all(promises);
		})
		.then(() => redis.close())
		.catch((err) => logger.time().file().tag('main').error('error', err, err.stack));
})();