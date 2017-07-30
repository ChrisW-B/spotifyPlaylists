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
const ONE_SEC = 1000,
  ONE_MIN = 60 * ONE_SEC;

module.exports = class MostPlayed {
  constructor(redis) {
    this.redis = redis;
  }

  // takes list of last.fm tracks and tries to find them in spotify
  convertToSpotify(topTracks) {
    return Promise.all(topTracks.map((ele, i) =>
      new Promise(async(resolve, reject) => {
        await sleep(ONE_SEC / 2 * i);
        logger.time().tag('Most Played').file().backend(`Searching for \n${ele.name} by ${ele.artist.name}`);
        const results = (await spotifyApi.searchTracks(`track:${ele.name} artist:${ele.artist.name}`))
          .body.tracks.items;
        if (results.length > 0 && results[0].uri) {
          resolve({
            id: results[0].uri,
            rank: ele['@attr'].rank
          });
        } else {
          logger.time().tag('Most Played').file().warning(`couldn't find ${ele.name} by ${ele.artist.name}`);
          resolve(undefined);
        }
      })
    ));
  }

  //add list of spotify tracks to a playlist
  fillPlaylist(userId, playlistId, tracklist) {
    return spotifyApi.addTracksToPlaylist(userId, playlistId, tracklist.map(i => i.id));
  }

  async clearExistingPlaylist(userId, playlist) {
    // create an empty playlist
    if (playlist.tracks.total > 0) {
      await spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, [...Array(playlist.tracks.total).keys()], playlist.snapshot_id);
    }
    return playlist.id;
  }

  foundOldPlaylist(playlists, oldPlaylist) {
    return playlists.findIndex(p => p.id === oldPlaylist);
  }

  async createNewPlaylist(userId) {
    return (await spotifyApi.createPlaylist(userId, 'Most Played', {
      'public': false
    })).body.id;
  }

  async preparePlaylist(userId, oldPlaylistId, offset = 0) {
    const userPlaylists = (await spotifyApi.getUserPlaylists(userId, {
      limit: 20,
      offset: offset
    })).body;
    const playlistLoc = this.foundOldPlaylist(userPlaylists.items, oldPlaylistId);
    if (playlistLoc > -1) {
      return this.clearExistingPlaylist(userId, userPlaylists.items[playlistLoc]);
    } else if (userPlaylists.next == null) {
      return this.createNewPlaylist(userId);
    } else {
      return this.preparePlaylist(userId, oldPlaylistId, offset + 20);
    }
  }

  insertMissingTracks(trackList, lastFmId, period) {
    let nextTrackSet;
    return Promise.all(trackList.map(async(ele) => {
      if (ele !== undefined) {
        return new Promise(resolve => {
          resolve(ele);
        });
      } else {
        if (nextTrackSet === undefined) {
          const topTracks = (await lastfm.user_getTopTracks({
            user: lastFmId,
            limit: trackList.length,
            period: period,
            page: 2
          }));
          const converted = this.convertToSpotify(topTracks);
          nextTrackSet = converted;
          for (let i = 0; i < nextTrackSet.length; i++) {
            const temp = nextTrackSet[i];
            nextTrackSet[i] = undefined;
            if (temp !== undefined) {
              return new Promise(resolve => {
                resolve(temp);
              });
            }
          }

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
  }

  async refreshToken(access, refresh) {
    //gets refresh token
    spotifyApi.setAccessToken(access);
    spotifyApi.setRefreshToken(refresh);
    return (await spotifyApi.refreshAccessToken()).body;
  }

  async updatePlaylist(userId, delayInc = 0) {
    await sleep(delayInc * ONE_MIN * 5);

    logger.time().tag('Most Played').file().backend('Getting database items');
    const memberInfo = {
      numTracks: await this.redis.hget(userId, 'most:length'),
      refresh: await this.redis.hget(userId, 'refresh'),
      token: await this.redis.hget(userId, 'token'),
      oldPlaylist: await this.redis.hget(userId, 'most:playlist'),
      lastFmId: await this.redis.hget(userId, 'most:lastfm'),
      timespan: await this.redis.hget(userId, 'most:period')
    };

    logger.time().tag('Most Played').file().backend('Logging in to spotify');
    const token = (await this.refreshToken(memberInfo.token, memberInfo.refresh));
    const newTokens = {
      token: token.access_token,
      refresh: token.refresh_token ? token.refresh_token : memberInfo.refresh
    };

    logger.time().tag('Most Played').file().backend('Setting new tokens');
    spotifyApi.setAccessToken(newTokens.token);
    spotifyApi.setRefreshToken(newTokens.refresh);

    logger.time().tag('Most Played').file().backend('logging in to lastfm');
    await lastfm.auth_getMobileSession();

    logger.time().tag('Most Played').file().backend('getting last.fm top tracks');
    const lastFmTrackList = await lastfm.user_getTopTracks({
      user: memberInfo.lastfmId,
      limit: Number(memberInfo.numTracks),
      period: memberInfo.timespan
    });

    logger.time().tag('Most Played').file().backend('converting to spotify and getting userinfo');
    const spotifyList = await this.convertToSpotify(lastFmTrackList.track, memberInfo.numTracks);
    const spotifyId = (await spotifyApi.getMe()).body.id;
    const trackList = await this.insertMissingTracks(spotifyList, memberInfo.lastFmId, memberInfo.timeSpan);

    logger.time().tag('Most Played').file().backend('sorting tracks, getting user, and preparing playlist');
    const newPlaylistId = await this.preparePlaylist(spotifyId, memberInfo.oldPlaylist);
    const sortedTracks = trackList.sort((a, b) => a.rank - b.rank);

    logger.time().tag('Most Played').file().backend('filling playlist');
    await this.fillPlaylist(spotifyId, newPlaylistId, sortedTracks);
    await this.redis.hset(userId, 'access', newTokens.token);
    await this.redis.hset(userId, 'refresh', newTokens.refresh);
    await this.redis.hset(userId, 'most:playlist', newPlaylistId);
  }

  async start() {
    logger.time().tag('Most Played').file().info('Starting');
    const members = await this.redis.smembers('users');
    await Promise.all(members.map(async member => {
      const enabled = String(await this.redis.hget(member, 'most')).toLowerCase() === 'true';
      let delayInc = 0;
      return enabled ? this.updatePlaylist(member, delayInc++) : null;
    }));
    logger.time().tag('Most Played').file().backend('Done!');
  }
};