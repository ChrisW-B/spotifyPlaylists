'use strict';

const SpotifyWebApi = require('spotify-web-api-node'),
    Redis = require('redisng'),
    sleep = require('sleep-promise'),
    config = require('./config'),
    redis = new Redis(),
    logger = process.console,
    spotifyApi = new SpotifyWebApi({
        clientId: config.recentlyAdded.clientId,
        clientSecret: config.recentlyAdded.clientSecret,
        redirectUri: config.recentlyAdded.redirectUri
    });

const RecentlyAdded = function() {
    const ONE_MIN = 60 * 1000,
        self = this;
    self.createTrackListArray = (recentlyAdded) => {
        // picks out the relevent data from the recently added songs list
        let tracks = [];
        recentlyAdded.forEach(ele => {
            tracks.push(ele.track.uri);
        });
        return tracks;
    };

    self.clearExistingPlaylist = (userId, playlist) => {
        // create an empty playlist
        return new Promise((resolve, reject) => {
            if (playlist.tracks.total > 0) {
                let numsToDelete = [];
                for (let j = 0; j < playlist.tracks.total; j++) {
                    numsToDelete.push(j);
                }
                spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, numsToDelete, playlist.snapshot_id).then(() => {
                    resolve(playlist.id);
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    };


    self.foundOldPlaylist = (playlists, oldPlaylist) => {
        //try to find old playlist, return index if you do
        for (let i = 0; i < playlists.length; i++) {
            if (playlists[i].id === oldPlaylist) {
                return i;
            }
        }
        return -1;
    };

    self.createNewPlaylist = userId => {
        return new Promise((resolve, reject) => {
            return spotifyApi.createPlaylist(userId, 'Recently Added', {
                'public': false
            }).then(playlist => {
                resolve(playlist.body.id);
            }).catch(err => {
                reject(err);
            });
        });
    };

    self.preparePlaylist = (userId, oldPlaylistId, offset = 0) => {
        return new Promise(resolve => {
            spotifyApi.getUserPlaylists(userId, {
                limit: 20,
                offset: offset
            }).then(playlists => {
                let playlistLoc = self.foundOldPlaylist(playlists.body.items, oldPlaylistId);
                if (playlistLoc > -1) {
                    resolve(self.clearExistingPlaylist(userId, playlists.body.items[playlistLoc]));
                } else if (playlists.body.next == null) {
                    resolve(self.createNewPlaylist(userId));
                } else {
                    resolve(self.preparePlaylist(userId, oldPlaylistId, offset + 20));
                }
            });
        });
    };

    self.refreshToken = (access, refresh) => {
        //gets refresh token
        spotifyApi.setAccessToken(access);
        spotifyApi.setRefreshToken(refresh);
        return spotifyApi.refreshAccessToken();
    };

    self.updatePlaylist = (userId, delayInc) => {
        const newTokens = {},
            ele = {};
        return sleep(5 * delayInc * ONE_MIN).then(() => {
            return Promise.all([
                redis.hget(userId, 'numTracks'),
                redis.hget(userId, 'refresh'),
                redis.hget(userId, 'token'),
                redis.hget(userId, 'oldPlaylist')
            ]);
        }).then(data => {
            ele.numTracks = data[0];
            ele.refresh = data[1];
            ele.token = data[2];
            ele.oldPlaylist = data[3];
            logger.time().file().info('Logging in to spotify');
            return self.refreshToken(ele.token, ele.refresh);
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
                self.preparePlaylist(userInfo.body.id, ele.oldPlaylist),
                spotifyApi.getMySavedTracks({
                    limit: ele.numTracks
                }), new Promise(resolve => {
                    resolve(userInfo.body.id);
                })
            ]);
        }).then(values => {
            logger.time().file().info('filling playlist');
            const newPlaylistId = values[0],
                savedTracks = values[1],
                spotifyId = values[2];
            return Promise.all([
                spotifyApi.addTracksToPlaylist(spotifyId,
                    newPlaylistId,
                    self.createTrackListArray(savedTracks.body.items)),
                new Promise(resolve => {
                    resolve(newPlaylistId);
                })
            ]);
        }).then((values) => {
            const newPlaylistId = values[1];
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
                self.updatePlaylist(ele, delayInc);
            }, 5 * ONE_MIN);
        });
    };

    self.start = () => {
        logger.time().file().tag('main').info('Starting');
        redis.connect().then(() => {
            return redis.smembers('users');
        }).then(users => {
            const promises = [];
            let delayInc = 0;
            users.forEach((userId) => {
                if (userId.includes('recent')) {
                    logger.time().file().info('updating', userId);
                    promises.push(self.updatePlaylist(userId, delayInc));
                    delayInc++;
                }
            });
            return Promise.all(promises);
        }).then(() => {
            logger.time().file().info('Done with recently added!');
            redis.close();
        }).catch((err) => {
            logger.time().file().tag('main').error('error', err, err.stack);
        });
    };
};

module.exports = RecentlyAdded;