var Lastfm = require('simple-lastfm'),
	SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	config = require('./config'),
	scribe = require('scribe-js')({
		createDefaultConsole: false
	});
var console = scribe.console({
	console: {
		colors: 'white'
	},
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
	lastfm.getSessionKey(
		function(result) {
			if (!result.success) {
				console.time().file().tag('getSessionKey').error(result.error);
			} else {
				var emptyTracks = [];
				getTracks(emptyTracks, lastfmId, numTracks, timeSpan, 1, oldPlaylist, function(newPlaylistId) {
					callback(newPlaylistId);
				});
			}
		});
};

function getTracks(tracks, lastfmId, numTracks, timeSpan, pageNum, oldPlaylist, callback) {
	if (tracks.length >= numTracks) {
		setTimeout(function() {
			createPlaylist(tracks, oldPlaylist, 0, function(data) {
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
				console.time().file().tag('getTracks').warning(err, data);
				//attempt to make a playlist with what we have
				if (tracks.length > 0) {
					setTimeout(function() {
						createPlaylist(tracks, oldPlaylist, 0, function(data) {
							callback(data);
						}, 5000);
					});
				}
			}
		});
	}
}

function getLastfmTracks(lastfmId, page, numTracks, timeSpan, callback) {
	lastfm.getTopTracks({
		user: lastfmId,
		limit: numTracks,
		period: timeSpan,
		page: page,
		callback: function(result) {
			if (result.success) {
				callback(false, result);
			} else {
				console.time().file().tag('getLastFmTracks').error(result);
				callback(true, null);
			}
		}
	});
};

function convertToSpotify(topTracks, numNeeded, callback) {
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
	title = title.replace('/', " ");
	artist = artist.replace('/', " ");
	spotifyApi.searchTracks(title + " " + artist, {
		limit: 1,
	})
		.then(function(data) {
			if (data.body.tracks.total < 1) {
				console.time().file().info('No result for', title, "by", artist);
				callback(true, null);
			} else {
				callback(false, data.body.tracks.items[0].uri);
			}
		}, function(err) {
			console.time().file().error('Problem finding song', title, "by", artist, err);
			callback(true, null);
		});
}

function addSongsToPlaylist(userId, trackList, playlistId) {
	var trackArray = [];
	for (var i = 0; i < trackList.length; i++) {
		trackArray.push(trackList[i].id);
	}
	spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray)
		.then(function(data) {
			console.time().file().info('Added tracks!');
		}, function(err) {
			console.time().file().tag('addSongsToPlaylist').error(err);
		});
}

function createBlankPlaylist(userId, prevPlaylist, trackList, playlists, callback) {
	var foundPlaylist = false;
	for (var i = 0; i < playlists.total; i++) {
		if (playlists.items[i].id === prevPlaylist) {
			if (playlists.items[i].tracks.total > 0) {
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
						callback(prevPlaylist)
					}, function(err) {
						console.time().file().tag('createBlankPlaylistFound').error(err);
					});
			} else {
				addSongsToPlaylist(userId, trackList, prevPlaylist);
				callback(prevPlaylist);
			}
			foundPlaylist = true;
			break;
		}
	}
	if (!foundPlaylist) {
		spotifyApi.createPlaylist(userId, 'Most Played', {
			'public': false
		}).then(function(data) {
			addSongsToPlaylist(userId, trackList, data.body.id);
			callback(data.body.id);
		}, function(err) {
			console.time().file().tag('createBlankPlaylistNotFound').error(err);
		});
	}
}

function createPlaylist(trackList, oldPlaylist, offset, callback) {
	spotifyApi.getMe().then(function(data) {
			var userId = data.body.id;
			spotifyApi.getUserPlaylists(userId, {
				limit: 20,
				offset: offset
			})
				.then(function(data) {
					if (data.body.next != null) {
						createPlaylist(trackList, oldPlaylist, offset + 20, function(data) {
							callback(data);
						});
					} else {
						createBlankPlaylist(userId, oldPlaylist, trackList, data.body, function(data) {
							callback(data);
						});
					}
				}, function(err) {
					console.time().file().tag('createPlaylist').error(err);
				});
		},
		function(err) {
			console.time().file().tag('getUser in createPlaylist').error(err)
		});
}

function refreshToken(access, refresh, callback) {
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
			console.time().file().tag('refreshToken').error(err);
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
							console.time().file().tag('refreshToken').error(err);
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
											console.time().file().warning('error writing file');
										}
									});
								});
						}
					});
				}
			});
		} else {
			console.time().file().error('error', err);
		}
	});
}
main();