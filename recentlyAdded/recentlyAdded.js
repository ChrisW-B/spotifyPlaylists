var SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	config = require('./config'),
	scribe = require('scribe-js')({
		createDefaultlog: false
	}),
	console = process.console;
var logger = scribe.console({
	logWriter: {
		rootPath: '../logs'
	}
});
// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
	clientId: config.clientId,
	clientSecret: config.clientSecret,
	redirectUri: config.redirectUri
});

function createTrackListArray(recentSongData) {
	logger.info('creating track list array');
	tracks = [];
	recentSongData.forEach(function(ele, id) {
		tracks.push('spotify:track:' + ele.track.id);
	});
	return tracks;
}

function addSongsToPlaylist(userId, recentSongData, playlistId) {
	logger.info('adding tracks to playlist')
	var trackArray = createTrackListArray(recentSongData);
	spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray).then(function(data) {
		logger.time().file().info('Added tracks!');
	}, function(err) {
		logger.time().file().tag('addSongsToPlaylist').error(err);
	});
}

function createBlankPlaylist(userId, playlist, trackList) {
	logger.info('creating blank playlist');
	if (playlist.tracks.total > 0) {
		var numsToDelete = [];
		for (var j = 0; j < playlist.tracks.total; j++) {
			numsToDelete.push(j);
		}
		logger.tag('createBlankPlaylist').info(playlist)
		spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, numsToDelete, playlist.snapshot_id).then(function(data) {
			addSongsToPlaylist(userId, trackList, playlist.id);
		}, function(err) {
			logger.time().file().tag('createBlankPlaylistFound').error(err);
		});
	} else {
		logger.info('empty playlist, adding songs');
		addSongsToPlaylist(userId, trackList, playlist.id);
	}
}

function foundOldPlaylist(playlists, oldPlaylist) {
	for (var i = 0; i < playlists.length; i++) {
		if (playlists[i].id === oldPlaylist) {
			logger.info('Found old playlist')
			return i;
		}
	}
	return -1;
}

function createNewPlaylist(userId, callback) {
	logger.info('creating new playlist');
	spotifyApi.createPlaylist(userId, 'Recently Added', {
		'public': false
	}).then(function(data) {
		callback(data.body);
	}, function(err) {
		logger.time().file().tag('createBlankPlaylistNotFound').error(err);
	});
}

function getPlaylist(recentSongData, oldPlaylist, offset, callback) {
	logger.info('looking for playlist')
	spotifyApi.getMe().then(function(data) {
		var userId = data.body.id;
		spotifyApi.getUserPlaylists(userId, {
			limit: 20,
			offset: offset
		}).then(function(data) {
			if (data.body.next != null) {
				var playlistLoc = foundOldPlaylist(data.body.items, oldPlaylist);
				if (playlistLoc > -1) {
					createBlankPlaylist(userId, data.body.items[playlistLoc], recentSongData);
					callback(oldPlaylist)
				} else {
					getPlaylist(recentSongData, oldPlaylist, offset + 20, function(data) {
						callback(data)
					});
				}
			} else {
				var playlistLoc = foundOldPlaylist(data.body.items, oldPlaylist);
				if (playlistLoc > -1) {
					createBlankPlaylist(userId, data.body.items[playlistLoc], recentSongData);
					callback(oldPlaylist)
				} else {
					createNewPlaylist(userId, function(playlist) {
						createBlankPlaylist(userId, playlist, recentSongData);
						callback(playlist.id)
					})
				}
			}
		}, function(err) {
			logger.time().file().tag('getPlaylist').error(err);
		});
	}, function(err) {
		logger.time().file().tag('getUser in getPlaylist').error(err)
	});
}

function getTracks(playlistId, numTracks, callback) {
	spotifyApi.getMySavedTracks({
		limit: numTracks,
		offset: 0
	}).then(function(data) {
		getPlaylist(data.body.items, playlistId, 0, function(data) {
			callback(data);
		});
	}, function(err) {
		logger.time().file().tag('getTracks').error(err);
	});
};

function refreshToken(access, refresh, callback) {
	spotifyApi.setAccessToken(access);
	spotifyApi.setRefreshToken(refresh);
	spotifyApi.refreshAccessToken().then(function(data) {
		access = data.body.access_token;
		refresh = data.body.refresh_token ? data.body.refresh_token : refresh;
		spotifyApi.setAccessToken(access);
		spotifyApi.setRefreshToken(refresh);
		callback(false, {
			token: access,
			refresh: refresh
		});
	}, function(err) {
		logger.time().file().tag('refreshToken').error(err);
		callback(true, null);
	});
};

function main() {
	jsonfile.readFile(config.fileLoc, function(err, obj) {
		if (!err) {
			obj.forEach(function(ele, id) {
				if (ele.hasOwnProperty("token")) {
					refreshToken(ele.token, ele.refresh, function(err, data) {
						if (err) {
							logger.time().file().tag('readFile').error(err);
						} else {
							var newTokens = data;
							getTracks(ele.oldPlaylist, ele.numTracks, function(data) {
								var newData = {
									userName: ele.userName,
									token: newTokens.token,
									refresh: newTokens.refresh,
									numTracks: ele.numTracks,
									oldPlaylist: data
								}
								obj[id] = newData;
								jsonfile.writeFile(config.fileLoc, obj, function(err) {
									if (err) {
										logger.time().file().tag('writeFile').error('error writing file');
									}
								});
							});
						}
					});
				}
			});
		} else {
			logger.time().file().tag('main').error(err);
		}
	});
}
main();