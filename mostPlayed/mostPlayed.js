var Lastfm = require('lastfm-njs'),
	SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	config = require('./config'),
	scribe = require('scribe-js')({
		createDefaultlog: false
	}),
	console = process.console;
var logger = scribe.console({
	logWriter: {
		rootPath: '../website/logs'
	}
});
var lastfm = new Lastfm({
	apiKey: config.lastfm.token,
	apiSecret: config.lastfm.secret,
	username: config.lastfm.username,
	password: config.lastfm.password
});
// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
	clientId: config.spotify.token,
	clientSecret: config.spotify.secret,
	redirectUri: config.spotify.redirectUri
});

function getLastfmData(lastfmId, oldPlaylist, numTracks, timeSpan, callback) {
	//signs in to last fm to prepare to get data
	logger.info('getting last.fm data');
	lastfm.auth_getMobileSession(function(result) {
		if (!result.success) {
			logger.time().file().tag('getSessionKey').error(result.error);
		} else {
			var emptyTracks = [];
			getTracks(emptyTracks, lastfmId, numTracks, timeSpan, 1, oldPlaylist, function(newPlaylistId) {
				callback(newPlaylistId);
			});
		}
	});
}

function getTracks(tracks, lastfmId, numTracks, timeSpan, pageNum, oldPlaylist, callback) {
	// manages getting tracks from last.fm, converting them to spotify, and putting them into a playlist
	logger.info('getting tracks data');
	if (tracks.length >= numTracks) {
		setTimeout(function() {
			getPlaylist(tracks, oldPlaylist, 0, function(data) {
				callback(data);
			}, 5000);
		});
	} else {
		getLastfmTracks(lastfmId, pageNum, numTracks, timeSpan, function(err, data) {
			if (!err) {
				setTimeout(function() {
					// logger.info(data);
					convertToSpotify(data.track, numTracks, function(currentTracks) {
						currentTracks.sort(function(a, b) {
							return a.rank - b.rank;
						});
						var max = (currentTracks.length + tracks.length) > numTracks ? numTracks - tracks.length : currentTracks.length;
						for (var i = 0; i < max; i++) {
							tracks.push(currentTracks[i]);
						}
						getTracks(tracks, lastfmId, numTracks, timeSpan, pageNum + 1, oldPlaylist, function(newPlaylistId) {
							callback(newPlaylistId);
						});
					});
				}, 5000);
			} else {
				logger.time().file().tag('getTracks').warning(err, data);
				//attempt to make a playlist with what we have
				if (tracks.length > 0) {
					setTimeout(function() {
						getPlaylist(tracks, oldPlaylist, 0, function(data) {
							callback(data);
						}, 5000);
					});
				}
			}
		});
	}
}

function getLastfmTracks(lastfmId, page, numTracks, timeSpan, callback) {
	//gets a list of tracks from last fm
	logger.info('getting last.fm tracks');
	lastfm.user_getTopTracks({
		user: lastfmId,
		limit: numTracks,
		period: timeSpan,
		page: page,
		callback: function(result) {
			if (result.success) {
				callback(false, result);
			} else {
				logger.time().file().tag('getLastFmTracks').error(result);
				callback(true, null);
			}
		}
	});
}

function convertToSpotify(topTracks, numNeeded, callback) {
	// takes list of last.fm tracks and tries to find them in spotify
	logger.info('converting to spotify');
	var tracks = [];
	topTracks.forEach(function(ele, id) {
		searchForSong(ele.name, ele.artist.name, function(err, spotifyId) {
			if (!err) {
				tracks.push({
					id: spotifyId,
					rank: ele['@attr'].rank
				});
			} else {
				numNeeded--;
			}
			if (tracks.length == numNeeded) {
				callback(tracks);
			}
		});
	});
}

function searchForSong(title, artist, callback) {
	//take last.fm data & search spotify
	logger.info('searching for ' + title + ' by ' + artist);
	query = "track:" + title + " artist:" + artist;
	spotifyApi.searchTracks(query, {
		limit: 1,
	}).then(function(data) {
		if (data.body.tracks.total < 1) {
			logger.time().file().info('No result for', title, "by ", artist);
			callback(true, null);
		} else {
			callback(false, data.body.tracks.items[0].uri);
		}
	}, function(err) {
		logger.time().file().error('Problem finding song', title, "by ", artist, err);
		callback(true, null);
	});
}

function addSongsToPlaylist(userId, trackList, playlistId) {
	//add list of spotify tracks to a playlist
	logger.info('adding tracks to playlist');
	var trackArray = [];
	for (var i = 0; i < trackList.length; i++) {
		trackArray.push(trackList[i].id);
	}
	spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray).then(function(data) {
		logger.time().file().info('Added tracks!');
	}, function(err) {
		logger.time().file().tag('addSongsToPlaylist').error(err);
	});
}

function createBlankPlaylist(userId, playlist, trackList) {
	// create an empty playlist
	logger.info('creating blank playlist');
	if (playlist.tracks.total > 0) {
		var numsToDelete = [];
		for (var j = 0; j < playlist.tracks.total; j++) {
			numsToDelete.push(j);
		}
		logger.tag('createBlankPlaylist').info(playlist);
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
	//try to find old playlist, return true if you do
	for (var i = 0; i < playlists.length; i++) {
		if (playlists[i].id === oldPlaylist) {
			logger.info('Found old playlist');
			return i;
		}
	}
	return -1;
}

function createNewPlaylist(userId, callback) {
	//create a new playlist??? idk what else to say thats what its called
	logger.info('creating new playlist');
	spotifyApi.createPlaylist(userId, 'Most Played', {
		'public': false
	}).then(function(data) {
		callback(data.body);
	}, function(err) {
		logger.time().file().tag('createBlankPlaylistNotFound').error(err);
	});
}

function getPlaylist(trackList, oldPlaylist, offset, callback) {
	// manages process of getting tracks from last.fm and putting them in a playlist
	logger.info('looking for playlist');
	spotifyApi.getMe().then(function(data) {
		var userId = data.body.id;
		spotifyApi.getUserPlaylists(userId, {
			limit: 20,
			offset: offset
		}).then(function(data) {
			var playlistLoc = "";
			if (data.body.next !== null) {
				playlistLoc = foundOldPlaylist(data.body.items, oldPlaylist);
				if (playlistLoc > -1) {
					createBlankPlaylist(userId, data.body.items[playlistLoc], trackList);
					callback(oldPlaylist);
				} else {
					getPlaylist(trackList, oldPlaylist, offset + 20, function(data) {
						callback(data);
					});
				}
			} else {
				playlistLoc = foundOldPlaylist(data.body.items, oldPlaylist);
				if (playlistLoc > -1) {
					createBlankPlaylist(userId, data.body.items[playlistLoc], trackList);
					callback(oldPlaylist);
				} else {
					createNewPlaylist(userId, function(playlist) {
						createBlankPlaylist(userId, playlist, trackList);
						callback(playlist.id);
					});
				}
			}
		}, function(err) {
			logger.time().file().tag('getPlaylist').error(err);
		});
	}, function(err) {
		logger.time().file().tag('getUser in getPlaylist').error(err);
	});
}

function refreshToken(access, refresh, callback) {
	//gets refresh token
	logger.info('refreshing token');
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
	logger.info('Starting');
	jsonfile.readFile(config.fileLoc, function(err, obj) {
		if (!err) {
			obj.forEach(function(ele, id) {
				if (ele.hasOwnProperty("token")) {
					refreshToken(ele.token, ele.refresh, function(err, data) {
						if (err) {
							logger.time().file().tag('refreshToken').error(err);
						} else {
							var newTokens = data;
							getLastfmData(ele.lastFmId, ele.oldPlaylist, ele.numTracks, ele.timeSpan, function(data) {
								var newData = {
									userName: ele.userName,
									lastFmId: ele.lastFmId,
									numTracks: ele.numTracks,
									timeSpan: ele.timeSpan,
									token: newTokens.token,
									refresh: newTokens.refresh,
									oldPlaylist: data
								};
								logger.info("writing ", newData);
								obj[id] = newData;
								jsonfile.writeFile(config.fileLoc, obj, function(err) {
									if (err) {
										logger.time().file().warning('error writing file');
									}
								});
							});
						}
					});
				}
			});
		} else {
			logger.time().file().error('error', err);
		}
	});
}
main();