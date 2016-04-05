var Lastfm = require('simple-lastfm'),
	SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	config = require('./config');

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


function getLastfmData(lastfmId, oldPlaylist, callback) {
	lastfm.getSessionKey(
		function(result) {
			if (!result.success) {
				console.log(result.error);
			} else {
				var emptyTracks = [];
				getTracks(emptyTracks, lastfmId, 50, 1, oldPlaylist, function(newPlaylistId) {
					callback(newPlaylistId);
				});
			}
		});
};

function getTracks(tracks, lastfmId, numTracks, pageNum, oldPlaylist, callback) {
	if (tracks.length >= numTracks) {
		setTimeout(function() {
			createPlaylist(tracks, oldPlaylist, 10, function(data) {
				callback(data);
			}, 5000);
		});
	} else {
		getLastfmTracks(lastfmId, pageNum, numTracks, function(err, data) {
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
						getTracks(tracks, lastfmId, numTracks, pageNum + 1, oldPlaylist, function(newPlaylistId) {
							callback(newPlaylistId);
						});
					});
				}, 5000);
			} else {
				console.log(err, data);
				//attempt to make a playlist with what we have
				if (tracks.length > 0) {
					setTimeout(function() {
						createPlaylist(tracks, oldPlaylist, 10, function(data) {
							callback(data);
						}, 5000);
					});
				}
			}
		});
	}
}

function getLastfmTracks(lastfmId, page, numTracks, callback) {
	lastfm.getTopTracks({
		user: lastfmId,
		limit: numTracks,
		period: '1month',
		page: page,
		callback: function(result) {
			if (result.success) {
				callback(false, result);
			} else {
				console.log("error getting lastfm", result);
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
				console.log('No result for', title, "by", artist);
				callback(true, null);
			} else {
				callback(false, data.body.tracks.items[0].uri);
			}
		}, function(err) {
			console.log('Problem finding song', title, "by", artist, err);
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
			console.log('Added tracks!');
		}, function(err) {
			console.log('Something went wrong! in adding', err);
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
				spotifyApi.removeTracksFromPlaylistByPosition(userId, playlists.items[i].id, numsToDelete, playlists.items[i].snapshot_id)
					.then(function(data) {
						addSongsToPlaylist(userId, trackList, prevPlaylist);
						callback(prevPlaylist)
					}, function(err) {
						console.log('Something went wrong in emptying playlist!', err);
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
			console.log('Something went wrong in creating playlist!', err);
		});
	}
}

function createPlaylist(trackList, oldPlaylist, numPlaylists, callback) {
	spotifyApi.getMe().then(function(data) {
			var userId = data.body.id;
			spotifyApi.getUserPlaylists(userId, {
				limit: numPlaylists
			})
				.then(function(data) {
					if (data.body.next != null) {
						createPlaylist(trackList, oldPlaylist, numPlaylists + 10, function(data) {
							callback(data);
						});
					} else {
						createBlankPlaylist(userId, oldPlaylist, trackList, data.body, function(data) {
							callback(data);
						});
					}
				}, function(err) {
					console.log('Something went wrong! in get user playlists', err);
				});
		},
		function(err) {
			console.log('Could not get user!', err)
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
			console.log('Could not refresh the token!', err.message);
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
							console.log('refresh error', err);
						} else {
							var newTokens = data;
							getLastfmData(ele.lastFmId, ele.oldPlaylist, function(data) {
								var newData = {
									userName: ele.userName,
									lastFmId: ele.lastFmId,
									token: newTokens.token,
									refresh: newTokens.refresh,
									oldPlaylist: data
								}
								obj[id] = newData;
								jsonfile.writeFile(config.fileLoc, obj, function(err) {
									if (err) {
										console.log('error writing file');
									}
								});
							});
						}
					});
				}
			});
		} else {
			console.log('error', err);
		}
	});
}
main();
