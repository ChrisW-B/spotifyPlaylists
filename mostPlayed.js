'use strict';

const Lastfm = require('lastfm-njs'),
  SpotifyWebApi = require('spotify-web-api-node'),
  sleep = require('sleep-promise'),
  config = require('./config'),
  logger = process.console,
  lastfm = new Lastfm({
    apiKey: config.lastfm.token,
    apiSecret: config.lastfm.secret,
    username: config.lastfm.username,
    password: config.lastfm.password
  }),
  spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri
  });

const MostPlayed = function (redis) {
  const ONE_SEC = 1000,
    ONE_MIN = 60 * ONE_SEC,
    self = this;

  self.convertToSpotify = topTracks => {
    // takes list of last.fm tracks and tries to find them in spotify
    return Promise.all(topTracks.map((ele, id) => {
      return new Promise((resolve) => {
        sleep(ONE_SEC * id)
          .then(() => {
            return spotifyApi.searchTracks(`track:${ele.name} artist:${ele.artist.name}`);
          })
          .then((spotifyData) => {
            const results = spotifyData.body.tracks.items;
            if (results.length > 0 && results[0].uri) {
              resolve({
                id: results[0].uri,
                rank: ele['@attr'].rank
              });
            } else {
              logger.time().tag('Most Played').file().warning(`couldn't find ${ele.name} by ${ele.artist.name}`);
              resolve(undefined);
            }
          }).catch(err => {
            logger.time().tag('Most Played').file().warning(`${err} \n\n ${err.stack} \ncouldn't find ${ele.name} by ${ele.artist.name}`);
            resolve(undefined);
          });
      });
    }));
  };


  self.fillPlaylist = (userId, playlistId, tracklist) => {
    //add list of spotify tracks to a playlist
    const trackArray = [];
    for (let i = 0; i < tracklist.length; i++) {
      trackArray.push(tracklist[i].id);
    }
    return spotifyApi.addTracksToPlaylist(userId, playlistId, trackArray);
  };

  self.clearExistingPlaylist = (userId, playlist) => {
    // create an empty playlist
    return new Promise((resolve, reject) => {
      console.log(JSON.stringify(playlist, null, 2))
      if (playlist.tracks.total > 0) {
        const numsToDelete = playlist.tracks.total.map((_,i)=>i);
        console.log(JSON.stringify({userId, id: playlist.id, numsToDelete, snap: playlist.snapshot_id}, null, 2))
        return spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, numsToDelete, playlist.snapshot_id)
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

  self.createNewPlaylist = (userId) => {
    return new Promise((resolve, reject) => {
      return spotifyApi.createPlaylist(userId, 'Most Played', {
        'public': false
      }).then(playlist => {
        resolve(playlist.body.id);
      }).catch(err => {
        reject(err);
      });
    });
  };

  self.preparePlaylist = (userId, oldPlaylistId, offset = 0) => new Promise((resolve) => {
    spotifyApi.getUserPlaylists(userId, {
      limit: 20,
      offset: offset
    }).then(playlists => {
      const playlistLoc = self.foundOldPlaylist(playlists.body.items, oldPlaylistId);
      console.log({
        playlistLoc
      })
      if (playlistLoc > -1) {
        resolve(self.clearExistingPlaylist(userId, playlists.body.items[playlistLoc]));
      } else if (playlists.body.next == null) {
        resolve(self.createNewPlaylist(userId));
      } else {
        resolve(self.preparePlaylist(userId, oldPlaylistId, offset + 20));
      }
    });
  });

  self.insertMissingTracks = (trackList, lastFmId, period) => {
    let nextTrackSet;
    return Promise.all(trackList.map((ele) => {
      if (ele !== undefined) {
        return new Promise(resolve => {
          resolve(ele);
        });
      } else {
        if (nextTrackSet === undefined) {
          return lastfm.user_getTopTracks({
            user: lastFmId,
            limit: trackList.length,
            period: period,
            page: 2
          }).then(lastFmTrackList => {
            const tracks = lastFmTrackList.track;
            return self.convertToSpotify(tracks);
          }).then(spotifyList => {
            nextTrackSet = spotifyList;
            for (let i = 0; i < nextTrackSet.length; i++) {
              const temp = nextTrackSet[i];
              nextTrackSet[i] = undefined;
              if (temp !== undefined) {
                return new Promise(resolve => {
                  resolve(temp);
                });
              }
            }
          });
        } else {
          for (let i = 0; i < nextTrackSet.length; i++) {
            const temp = nextTrackSet[i];
            nextTrackSet[i] = undefined;
            if (temp !== undefined) {
              return new Promise(resolve => {
                resolve(temp);
              });
            }
          }
        }
      }
    }));
  };

  self.refreshToken = (access, refresh) => {
    //gets refresh token
    spotifyApi.setAccessToken(access);
    spotifyApi.setRefreshToken(refresh);
    return spotifyApi.refreshAccessToken();
  };

  self.sortSpotifyTracks = tracks => new Promise(resolve => {
    resolve(tracks.sort(function (a, b) {
      return a.rank - b.rank;
    }));
  });


  self.updatePlaylist = (userId, delayInc = 0) => {
    const newTokens = {},
      ele = {};
    logger.time().tag('Most Played').file().backend('Getting database items');
    console.log(JSON.stringify(userId, null, 2))
    return sleep(delayInc * ONE_MIN * 5).then(() => Promise.all([
      redis.hget(userId, 'most:length'),
      redis.hget(userId, 'refresh'),
      redis.hget(userId, 'token'),
      redis.hget(userId, 'most:playlist'),
      redis.hget(userId, 'most:lastfm'),
      redis.hget(userId, 'most:period')
    ])).then(data => {
      ele.numTracks = data[0];
      ele.refresh = data[1];
      ele.token = data[2];
      ele.oldPlaylist = data[3];
      ele.lastFmId = data[4];
      ele.timespan = data[5];
      console.log(JSON.stringify({
        ele
      }, null, 2))
      logger.time().tag('Most Played').file().backend('Logging in to spotify');
      return self.refreshToken(ele.token, ele.refresh);
    }).then(data => {
      newTokens.token = data.body.access_token;
      newTokens.refresh = data.body.refresh_token ? data.body.refresh_token : ele.refresh;
      spotifyApi.setAccessToken(newTokens.token);
      spotifyApi.setRefreshToken(newTokens.refresh);
      logger.time().tag('Most Played').file().backend('logging in to lastfm');
      return lastfm.auth_getMobileSession();
    }).then(() => {
      logger.time().tag('Most Played').file().backend('getting last.fm top tracks');
      return lastfm.user_getTopTracks({
        user: ele.lastfmId,
        limit: Number(ele.numTracks),
        period: ele.timespan
      });
    }).then(lastFmTrackList => {
      logger.time().tag('Most Played').file().backend('converting to spotify and getting userinfo');
      return self.convertToSpotify(lastFmTrackList.track, ele.numTracks);
    }).then((spotifyList) => {
      return Promise.all([
        spotifyApi.getMe(),
        self.insertMissingTracks(spotifyList, ele.lastFmId, ele.timeSpan)
      ]);
    }).then(values => {
      logger.time().tag('Most Played').file().backend('sorting tracks, getting user, and preparing playlist');
      const spotifyId = values[0].body.id,
        convertedList = values[1];
      return Promise.all([
        new Promise(resolve => {
          resolve(spotifyId);
        }),
        self.preparePlaylist(spotifyId, ele.oldPlaylist),
        self.sortSpotifyTracks(convertedList)
      ]);
    }).then(values => {

      logger.time().tag('Most Played').file().backend('filling playlist');
      const userId = values[0],
        newPlaylistId = values[1],
        sortedTracks = values[2];
      return Promise.all([
        new Promise(resolve => {
          resolve(newPlaylistId);
        }),
        self.fillPlaylist(userId, newPlaylistId, sortedTracks)
      ]);
    }).then((values) => {
      const newPlaylistId = values[0];
      return Promise.all([
        redis.hset(userId, 'access', newTokens.token),
        redis.hset(userId, 'refresh', newTokens.refresh),
        redis.hset(userId, 'most:playlist', newPlaylistId)
      ]);
    }).catch(err => {
      logger.time().tag('Most Played').file().warning('oops!');
      logger.time().tag('Most Played').file().warning(err, err.stack);
      //try again in a few minutes
      setTimeout(() => {
        self.updatePlaylist(ele, delayInc);
      }, 5 * ONE_MIN);
    });
  };

  self.start = () => {
    logger.time().tag('Most Played').file().info('Starting');
    redis.smembers('users')
      .then(users => Promise.all(users.map(user => Promise.all(
        [redis.hget(user, 'most'), new Promise(resolve => resolve(user))]))))
      .then((userData) => {
        let delayInc = 0;
        return Promise.all(userData.map(user => {
          const enabled = String(user[0]).toLowerCase() === 'true',
            userName = user[1];

          if (enabled) {
            console.log(JSON.stringify({
              userName,
              user
            }))
            return self.updatePlaylist(userName, delayInc++);
          }
        }));
      })
      .then(() => {
        logger.time().tag('Most Played').file().backend('Done!');
      })
      .catch((err) => {
        logger.time().tag('Most Played').file().error('error', err, err.stack);
      });
  };
};

module.exports = MostPlayed;