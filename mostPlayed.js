'use strict';

const Lastfm = require('lastfm-njs'),
  sleep = require('sleep-promise'),
  Playlist = require('./Playlist'),
  config = require('./config'),
  logger = process.console,
  lastfm = new Lastfm({
    apiKey: config.lastfm.token,
    apiSecret: config.lastfm.secret,
    username: config.lastfm.username,
    password: config.lastfm.password
  }),
  ONE_SEC = 1000,
  ONE_MIN = 60 * ONE_SEC;

module.exports = class MostPlayed extends Playlist {
  constructor(redis) {
    super(redis, 'most');
    this.redis = redis;
  }

  // takes list of last.fm tracks and tries to find them in spotify
  convertToSpotify(topTracks) {
    return Promise.all(topTracks.map((ele, i) =>
      new Promise(async(resolve, reject) => {
        await sleep(ONE_SEC / 2 * i);
        logger.time().tag(this.playListName).file().backend(`Searching for \n${ele.name} by ${ele.artist.name}`);
        const results = (await this.spotifyApi.searchTracks(`track:${ele.name} artist:${ele.artist.name}`))
          .body.tracks.items;
        if (results.length > 0 && results[0].uri) {
          resolve({
            id: results[0].uri,
            rank: ele['@attr'].rank
          });
        } else {
          logger.time().tag(this.playListName).file().warning(`couldn't find ${ele.name} by ${ele.artist.name}`);
          resolve(undefined);
        }
      })
    ));
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

  async updatePlaylist(userId, delayInc = 0) {
    await sleep(delayInc * ONE_MIN * 5);

    logger.time().tag(this.playListName).file().backend('Getting database items');
    const memberInfo = {
      numTracks: await this.redis.hget(userId, `${this.type}:length`),
      refresh: await this.redis.hget(userId, 'refresh'),
      token: await this.redis.hget(userId, 'token'),
      oldPlaylist: await this.redis.hget(userId, `${this.type}:playlist`),
      lastFmId: await this.redis.hget(userId, `${this.type}:lastfm`),
      timespan: await this.redis.hget(userId, `${this.type}:period`)
    };

    logger.time().tag(this.playListName).file().backend('Logging in to spotify');
    const token = (await this.refreshToken(memberInfo.token, memberInfo.refresh));
    const newTokens = {
      token: token.access_token,
      refresh: token.refresh_token ? token.refresh_token : memberInfo.refresh
    };

    logger.time().tag(this.playListName).file().backend('Setting new tokens');
    this.spotifyApi.setAccessToken(newTokens.token);
    this.spotifyApi.setRefreshToken(newTokens.refresh);

    logger.time().tag(this.playListName).file().backend('logging in to lastfm');
    await lastfm.auth_getMobileSession();

    logger.time().tag(this.playListName).file().backend('getting last.fm top tracks');
    const lastFmTrackList = await lastfm.user_getTopTracks({
      user: memberInfo.lastfmId,
      limit: Number(memberInfo.numTracks),
      period: memberInfo.timespan
    });

    logger.time().tag(this.playListName).file().backend('converting to spotify and getting userinfo');
    const spotifyList = await this.convertToSpotify(lastFmTrackList.track, memberInfo.numTracks);
    const spotifyId = (await this.spotifyApi.getMe()).body.id;
    const trackList = await this.insertMissingTracks(spotifyList, memberInfo.lastFmId, memberInfo.timeSpan);

    logger.time().tag(this.playListName).file().backend('sorting tracks, getting user, and preparing playlist');
    const newPlaylistId = await this.preparePlaylist(spotifyId, memberInfo.oldPlaylist);
    const sortedTracks = trackList.sort((a, b) => a.rank - b.rank);

    logger.time().tag(this.playListName).file().backend('filling playlist');
    await this.fillPlaylist(spotifyId, newPlaylistId, sortedTracks);
    await this.redis.hset(userId, 'access', newTokens.token);
    await this.redis.hset(userId, 'refresh', newTokens.refresh);
    await this.redis.hset(userId, `${this.type}:playlist`, newPlaylistId);
  }
};