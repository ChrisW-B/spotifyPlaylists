var SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	Redis = require('redisng'),
	redis = new Redis(),
	config = require('./config'),
	scribe = require('scribe-js')({
		createDefaultlog: false
	}),
	console = process.console,
	logger = scribe.console({
		logWriter: {
			rootPath: '../website/logs'
		}
	}),
	spotifyApi = new SpotifyWebApi({
		clientId: config.clientId,
		clientSecret: config.clientSecret,
		redirectUri: config.redirectUri
	});

const ONE_MIN = 60 * 1000;

function createTrackListArray(recentlyAdded) {
	// picks out the relevent data from the recently added songs list
	tracks = [];
	recentlyAdded.forEach(function(ele, id) {
		tracks.push(ele.track.uri);
	});
	return tracks;
}

function clearExistingPlaylist(userId, playlist) {
	// create an empty playlist
	return new Promise((resolve, _) => {
		if (playlist.tracks.total > 0) {
			var numsToDelete = [];
			for (var j = 0; j < playlist.tracks.total; j++) {
				numsToDelete.push(j);
			}
			spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, numsToDelete, playlist.snapshot_id).then(() => {
				resolve(playlist.id);
			}).catch((err) => {
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
		return spotifyApi.createPlaylist(userId, 'Recently Added', {
			'public': false
		}).then(playlist => {
			resolve(playlist.body.id);
		}).catch(err => {
			reject(err);
		})
	});
}

function preparePlaylist(userId, oldPlaylistId, offset = 0) {
	return new Promise((resolve, reject) => {
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

function refreshToken(access, refresh) {
	//gets refresh token
	spotifyApi.setAccessToken(access);
	spotifyApi.setRefreshToken(refresh);
	return spotifyApi.refreshAccessToken();
};

function sleep(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time)
	})
}

function updatePlaylist(userId, delayInc) {
	var newTokens = {};
	var ele = {};
	return sleep(5 * delayInc * ONE_MIN).then(() => {
		return Promise.all([
			redis.hget(userId, 'numtracks'),
			redis.hget(userId, 'refresh'),
			redis.hget(userId, 'token'),
			redis.hget(userId, 'oldPlaylist')
		])
	}).then(data => {
		ele.numtracks = data[0];
		ele.refresh = data[1];
		ele.token = data[2];
		ele.oldPlaylist = data[3];
		logger.time().file().info('Logging in to spotify');
		return refreshToken(ele.token, ele.refresh)
	}).then(data => {
		newTokens.token = data.body.access_token;
		newTokens.refresh = data.body.refresh_token ? data.body.refresh_token : ele.refresh;
		spotifyApi.setAccessToken(newTokens.token);
		spotifyApi.setRefreshToken(newTokens.refresh);
		logger.time().file().time().info('Getting user info');
		return spotifyApi.getMe();
	}).then(userInfo => {
		logger.time().file().info('preparing playlist and getting saved tracks');
		return Promise.all([
			preparePlaylist(userInfo.body.id, ele.oldPlaylist),
			spotifyApi.getMySavedTracks({
				limit: ele.numTracks
			}), new Promise(resolve => {
				resolve(userInfo.body.id);
			})
		]);
	}).then(values => {
		logger.time().file().info('filling playlist');
		var newPlaylistId = values[0],
			savedTracks = values[1],
			spotifyId = values[2];
		return Promise.all([
			spotifyApi.addTracksToPlaylist(spotifyId,
				newPlaylistId,
				createTrackListArray(savedTracks.body.items)),
			new Promise(resolve => {
				resolve(newPlaylistId);
			})
		]);
	}).then((values) => {
		var newPlaylistId = values[1];
		logger.time().file().info('Updating database');
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
	redis.connect().then(() => {
		return redis.smembers('users');
	}).then(users => {
		var promises = [];
		var delayInc = 0;
		users.forEach((userId) => {
			if (userId.includes('recent')) {
				logger.time().file().info('updating', userId);
				promises.push(updatePlaylist(userId, delayInc));
				delayInc++;
			}
		});
		return Promise.all(promises);
	}).then(() => {
		redis.close();
	}).catch(() => {
		logger.time().file().tag('main').error(err);
	});
})();