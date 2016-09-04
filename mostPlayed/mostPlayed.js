var Lastfm = require('simple-lastfm'),
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
		rootPath: '../logs'
	}
});

var lastfm = new Lastfm({
	api_key: config.lastfm.token,
	api_secret: config.lastfm.secret,
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
	logger.info('getting last.fm data')
	lastfm.getSessionKey(
		function(result) {
			if (!result.success) {
				logger.time().file().tag('getSessionKey').error(result.error);
			} else {
				var emptyTracks = [];
				getTracks(emptyTracks, lastfmId, numTracks, timeSpan, 1, oldPlaylist, function(newPlaylistId) {
					callback(newPlaylistId);
				});
			}
		});
};

function getTracks(tracks, lastfmId, numTracks, timeSpan, pageNum, oldPlaylist, callback) {
	logger.info('getting tracks data')
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
					convertToSpotify(data.topTracks, numTracks, function(currentTracks) {
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
	logger.info('getting last.fm tracks')
	lastfm.getTopTracks({
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
};

function convertToSpotify(topTracks, numNeeded, callback) {
	logger.info('converting to spotify')
	var tracks = [];
	topTracks.forEach(function(ele, id) {
		searchForSong(ele.name, ele.artist.name,
			function(err, spotifyId) {
				if (!err) {
					tracks.push({
						id: spotifyId,
						rank: ele['@'].rank
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
	logger.info('searching for ' + title + ' by ' +
		artist)
	title = title.replace('/', " ");
	artist = artist.replace('/', " ");
	spotifyApi.searchTracks(title + " " + artist, {
		limit: 1,
	})
		.then(function(data) {
			if (data.body.tracks.total < 1) {
				logger.time().file().info('No result for', title, "by", artist);
				callback(true, null);
			} else {
				callback(false, data.body.tracks.items[0].uri);
			}
		}, function(err) {
			logger.time().file().error('Problem finding song', title, "by", artist, err);
			callback(true, null);
		});
}

function addSongsToPlaylist(userId, trackList, playlistId) {
	logger.info('adding tracks to playlist')
	var trackArray = [];
	for (var i = 0; i < trackList.length; i++) {
		trackArray.push(trackList[i].id);
	}
	spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray)
		.then(function(data) {
			logger.time().file().info('Added tracks!');
		}, function(err) {
			logger.time().file().tag('addSongsToPlaylist').error(err);
		});
}

function createBlankPlaylist(userId, playlist, trackList) {
	logger.info('creating blank playlist')
	if (playlist.tracks.total > 0) {
		var numsToDelete = [];
		for (var j = 0; j < playlists.items[i].tracks.total; j++) {
			numsToDelete.push(j);
		}
		spotifyApi.removeTracksFromPlaylistByPosition(userId,
			playlists.items[i].id,
			numsToDelete,
			playlists.items[i].snapshot_id)
			.then(function(data) {
				addSongsToPlaylist(userId, trackList, prevPlaylist);
			}, function(err) {
				logger.time().file().tag('createBlankPlaylistFound').error(err);
			});
	} else {
		addSongsToPlaylist(userId, trackList, prevPlaylist);
	}

}

function foundOldPlaylist(playlists, oldPlaylist) {
	for (var i = 0; i < playlists.length; i++) {
		if (playlists[i].id === prevPlaylist) {
			logger.log('Found old playlist')
			return i;
		}
	}
	return -1;
}

function createNewPlaylist(userId, callback) {
	logger.info('creating new playlist');
	spotifyApi.createPlaylist(userId, 'Most Played', {
		'public': false
	}).then(function(data) {
		callback(data.body.id);
	}, function(err) {
		logger.time().file().tag('createBlankPlaylistNotFound').error(err);
	});
}

function getPlaylist(trackList, oldPlaylist, offset, callback) {
	logger.info('creating playlist')
	spotifyApi.getMe().then(function(data) {
			var userId = data.body.id;
			logger.tag('userName').info(userId)
			spotifyApi.getUserPlaylists(userId, {
				limit: 20,
				offset: offset
			}).then(function(data) {
				if (data.body.next != null) {
					var playlistLoc = foundOldPlaylist(data.body.items, oldPlaylist);
					logger.tag('PlaylistData notNull').log({
						"oldplaylist": oldplaylist,
						"offset": offset,
						"location": playlistLoc,
						"next": data.body.next
					});
					if (playlistLoc > -1) {
						createBlankPlaylist(userId, data.body.items[i], trackList);
						callback(oldPlaylist)
					} else {
						getPlaylist(trackList, oldPlaylist, offset + 20, function(data) {
							callback(data)
						});
					}
				} else {
					var playlistLoc = foundOldPlaylist(data.body.items, oldPlaylist);
					logger.tag('PlaylistData null').log({
						"oldplaylist": oldplaylist,
						"offset": offset,
						"location": playlistLoc,
						"next": data.body.next
					});
					if (playlistLoc > -1) {
						createBlankPlaylist(userId, data.body.items[i], trackList);
						callback(oldPlaylist)
					} else {
						createNewPlaylist(userId, function(playlistId) {
							createBlankPlaylist(userId, playlistId, trackList);
							callback(playlistId)
						})
					}
				}
			}, function(err) {
				logger.time().file().tag('getPlaylist').error(err);
			});
		},
		function(err) {
			logger.time().file().tag('getUser in getPlaylist').error(err)
		});
}

function refreshToken(access, refresh, callback) {
	logger.info('refreshing token')
	spotifyApi.setAccessToken(access);
	spotifyApi.setRefreshToken(refresh);
	spotifyApi.refreshAccessToken()
		.then(function(data) {
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
	logger.info('Starting')
	jsonfile.readFile(config.fileLoc, function(err, obj) {
		if (!err) {
			obj.forEach(function(ele, id) {
				if (ele.hasOwnProperty("token")) {
					refreshToken(ele.token, ele.refresh, function(err, data) {
						if (err) {
							logger.time().file().tag('refreshToken').error(err);
						} else {
							var newTokens = data;
							getLastfmData(ele.lastFmId, ele.oldPlaylist, ele.numTracks,
								ele.timeSpan, function(data) {
									var newData = {
										userName: ele.userName,
										lastFmId: ele.lastFmId,
										numTracks: ele.numTracks,
										timeSpan: ele.timeSpan,
										token: newTokens.token,
										refresh: newTokens.refresh,
										oldPlaylist: data
									}
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