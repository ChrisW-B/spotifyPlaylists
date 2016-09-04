var SpotifyWebApi = require('spotify-web-api-node'),
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

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
	clientId: config.clientId,
	clientSecret: config.clientSecret,
	redirectUri: config.redirectUri
});

function createTrackListArray(recentSongData) {
	tracks = [];
	recentSongData.forEach(function(ele, id) {
		tracks.push('spotify:track:' + ele.track.id);
	});
	return tracks;
}

function addSongsToPlaylist(userId, recentSongData, playlistId, callback) {
	var trackArray = createTrackListArray(recentSongData);
	spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray)
		.then(function(data) {
			callback(playlistId);
		}, function(err) {
			console.time().file().tag('addSongsToPlaylist').error(err);
		});
}

function createBlankPlaylist(userId, recentSongData, playlists, prevPlaylist, callback) {
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
						console.time().file().info('Tracks removed from playlist!');
						addSongsToPlaylist(userId, recentSongData, playlists.items[i].id,
							function(data) {
								callback(data);
							});
					}, function(err) {
						console.time().file().info('Something went wrong!', err);
					});
			} else {
				addSongsToPlaylist(userId, recentSongData, playlists.items[i].id,
					function(data) {
						callback(data);
					});
			}
			foundPlaylist = true;
			break;
		}
	}
	if (!foundPlaylist) {
		spotifyApi.createPlaylist(userId, 'Recently Added', {
			'public': false
		}).then(function(data) {
			console.time().file().info('Created new playlist!, id is ', data.body.id);
			addSongsToPlaylist(userId, recentSongData, data.body.id, function(data) {
				callback(data);
			});

		}, function(err) {
			console.time().file().tag('createBlankPlaylist').error(err);
		});
	}
}

function createPlaylist(recentSongData, numPlaylists, playlistId, callback) {
	spotifyApi.getMe().then(function(data) {
			var userId = data.body.id;
			spotifyApi.getUserPlaylists(userId, {
				limit: numPlaylists
			}).then(function(data) {
				if (data.body.next != null) {
					createPlaylist(recentSongData, numPlaylists + 10, playlistId, function(data) {
						callback(data);
					});
				} else {
					createBlankPlaylist(userId, recentSongData, data.body, playlistId, function(data) {
						callback(data);
					});
				}
			}, function(err) {
				console.time().file().tag('createPlaylist').error(err);
			});
		},
		function(err) {
			console.time().file().tag('getUser').error(err);
		})
}

function getTracks(playlistId, numTracks, callback) {
	spotifyApi.getMySavedTracks({
		limit: numTracks,
		offset: 0
	}).then(function(data) {
		createPlaylist(data.body.items, 10, playlistId, function(data) {
			callback(data);
		});
	}, function(err) {
		console.time().file().tag('getTracks').error(err);
	});
};



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
							console.time().file().tag('readFile').error(err);
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
										console.time().file().tag('writeFile').error('error writing file');
									}
								});
							});
						}
					});
				}
			});
		} else {
			console.time().file().tag('main').error(err);
		}
	});
}

main();