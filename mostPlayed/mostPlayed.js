var Lastfm = require('lastfm-njs'),
	SpotifyWebApi = require('spotify-web-api-node'),
	jsonfile = require('jsonfile'),
	util = require('util'),
	config = require('./config'),
	scribe = require('scribe-js')({
		createDefaultlog: false
	}),
	console = process.console,
	logger = scribe.console({
		logWriter: {
			rootPath: './website/logs'
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

const ONE_MIN = 60 * 1000;

function convertToSpotify(topTracks, numNeeded) {
	// takes list of last.fm tracks and tries to find them in spotify
	return new Promise((resolve, reject) => {
		var tracks = [];
		topTracks.forEach((ele, id) => {
			spotifyApi.searchTracks("track:" + ele.name + " artist:" + ele.artist.name)
				.then(spotifyData => {
					var results = spotifyData.body.tracks.items;
					if (results.length > 0 && results[0].uri) {
						var newTrack = {
							id: results[0].uri,
							rank: ele['@attr'].rank
						};
						tracks.push(newTrack);
					}
					if (tracks.length == numNeeded) {
						resolve(tracks);
					}
				}).catch((err) => {
					reject(err);
				});
		});
	});
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
		return spotifyApi.createPlaylist(userId, 'Most Played', {
			'public': false
		}).then(playlist => {
			resolve(playlist.body.id);
		}).catch(err => {
			setTimeout(function() {
				return createNewPlaylist(userId);
			}, 5000);
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

function sortSpotifyTracks(tracks, numTracks) {
	return new Promise((resolve, reject) => {
		var spotifyList = [];
		tracks.sort(function(a, b) {
			return a.rank - b.rank;
		});
		for (var i = 0; i < numTracks; i++) {
			spotifyList.push(tracks[i]);
		}
		resolve(spotifyList);
	});
}

function updatePlaylist(ele, id, obj) {
	if (ele.hasOwnProperty("token")) {
		var tracklist = [],
			userInfo = {},
			newTokens = {},
			newPlaylistId = "",
			self = this;
		logger.time().file().info('Logging in to spotify');
		refreshToken(ele.token, ele.refresh).then(
			data => {
				newTokens.token = data.body.access_token;
				newTokens.refresh = data.body.refresh_token ? data.body.refresh_token : ele.refresh;
				spotifyApi.setAccessToken(newTokens.token);
				spotifyApi.setRefreshToken(newTokens.refresh);
				logger.time().file().info('logging in to lastfm');
				return lastfm.auth_getMobileSession();
			}).then(() => {
			logger.time().file().info('getting last.fm');
			return lastfm.user_getTopTracks({
				user: ele.lastfmId,
				limit: Number(ele.numTracks) + 50, //add 50 so we can skip ones not in library
				period: ele.timeSpan
			});
		}).then(lastFmTrackList => {
			logger.time().file().info('converting to spotify');
			return convertToSpotify(lastFmTrackList.track, ele.numTracks);
		}).then(spotifyTrackList => {
			logger.time().file().info('sorting tracks');
			return sortSpotifyTracks(spotifyTrackList, ele.numTracks);
		}).then(sortedSpotify => {
			self.tracklist = sortedSpotify;
			logger.time().file().info('getting user');
			return spotifyApi.getMe();
		}).then(userInfo => {
			self.userInfo = userInfo;
			logger.time().file().info('preparing playlist');
			return preparePlaylist(self.userInfo.body.id, ele.oldPlaylist);
		}).then(playlistId => {
			logger.time().file().info('filling playlist');
			self.newPlaylistId = playlistId;
			return fillPlaylist(self.userInfo.body.id, playlistId, self.tracklist);
		}).then(() => {
			var newData = {
				userName: ele.userName,
				lastFmId: ele.lastFmId,
				numTracks: ele.numTracks,
				timeSpan: ele.timeSpan,
				token: newTokens.token,
				refresh: newTokens.refresh,
				oldPlaylist: self.newPlaylistId
			};
			logger.time().file().info("writing ", newData);
			obj[id] = newData;
			jsonfile.writeFile(config.fileLoc, obj, function(err) {
				if (err) {
					logger.time().file().warning('error writing file');
				}
			});
		}).catch((err) => {
			logger.time().file().error(err);
			logger.time().file().error(err.stack);
		});
	}
}

function main() {
	logger.time().file().info('Starting');
	jsonfile.readFile(config.fileLoc, function(err, obj) {
		if (!err) {
			obj.forEach((ele, id) => {
				setTimeout(() => {
					updatePlaylist(ele, id, obj)
				}, 5 * ONE_MIN * id);
			});
		} else {
			logger.time().file().error('error', err);
		}
	});
}
main();