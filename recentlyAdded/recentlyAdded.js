var SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
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

function updatePlaylist(ele, id, obj) {
	if (ele.hasOwnProperty("token")) {
		var userId = "",
			newTokens = {},
			newPlaylistId = "",
			self = this;
		logger.time().file().info('Logging in to spotify');
		refreshToken(ele.token, ele.refresh).then(data => {
			newTokens.token = data.body.access_token;
			newTokens.refresh = data.body.refresh_token ? data.body.refresh_token : ele.refresh;
			spotifyApi.setAccessToken(newTokens.token);
			spotifyApi.setRefreshToken(newTokens.refresh);
			logger.time().file().time().info('Getting user info');
			return spotifyApi.getMe();
		}).then(userInfo => {
			self.userId = userInfo.body.id;
			logger.time().file().info('preparing playlist');
			return preparePlaylist(self.userId,
				ele.oldPlaylist);
		}).then(playlistId => {
			self.newPlaylistId = playlistId;
			return spotifyApi.getMySavedTracks({
				limit: ele.numTracks,
				offset: 0
			});
		}).then(savedTracks => {
			logger.time().file().info('filling playlist');
			return spotifyApi.addTracksToPlaylist(self.userId,
				self.newPlaylistId,
				createTrackListArray(savedTracks.body.items));
		}).then(() => {
			var newData = {
				userName: ele.userName,
				token: newTokens.token,
				refresh: newTokens.refresh,
				numTracks: ele.numTracks,
				oldPlaylist: self.newPlaylistId
			};
			obj[id] = newData;
			jsonfile.writeFile(config.fileLoc, obj, function(err) {
				if (err) {
					logger.time().file().tag('writeFile').error('error writing file');
				}
			});
		}).catch(err => {
			logger.time().file().error(err);
			logger.time().file().error(err.stack);
			//try again in a few minutes
			setTimeout(() => {
				updatePlaylist(ele, id, obj);
			}, 5 * ONE_MIN);
		});
	}
}

function main() {
	jsonfile.readFile(config.fileLoc, function(err, obj) {
		if (!err) {
			obj.forEach((ele, id) => {
				setTimeout(() => {
					updatePlaylist(ele, id, obj)
				}, 5 * ONE_MIN * id);
			});
		} else {
			logger.time().file().tag('main').error(err);
		}
	});
}
main();