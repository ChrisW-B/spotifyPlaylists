// server/Playlists/mostPlayed.js

'use strict';

const Lastfm = require('lastfm-njs');
const sleep = require('sleep-promise');
const Playlist = require('./Playlist');

module.exports = class MostPlayed extends Playlist {
  constructor(logger, redis, spotifyData, lastFmData) {
    super(logger, redis, spotifyData, 'most');
    this.redis = redis;
    this.lastfm = new Lastfm(lastFmData);
  }

  // takes list of last.fm tracks and tries to find them in spotify
  convertToSpotify(topTracks) {
    return Promise.all(topTracks.map((ele, i) =>
      new Promise(async(resolve) => {
        await sleep((this.ONE_SEC / 2) * i);
        this.logger.mostPlayed(`Searching for \n${ele.name} by ${ele.artist.name}`);
        const results = (await this.spotifyApi.searchTracks(`track:${ele.name} artist:${ele.artist.name}`))
          .body.tracks.items;
        if (results.length > 0 && results[0].uri) {
          resolve({
            id: results[0].uri,
            rank: ele['@attr'].rank
          });
        } else {
          this.logger.mostPlayed(`couldn't find ${ele.name} by ${ele.artist.name}`);
          resolve(undefined);
        }
      }),
    ));
  }

  insertMissingTracks(trackList, lastFmId, period) {
    let nextTrackSet;
    return Promise.all(trackList.map(async(ele) => {
      if (ele !== undefined) {
        return new Promise((resolve) => {
          resolve(ele);
        });
      }
      if (nextTrackSet === undefined) {
        const topTracks = (await this.lastfm.user_getTopTracks({
          user: lastFmId,
          limit: trackList.length,
          period,
          page: 2
        }));
        const converted = this.convertToSpotify(topTracks);
        nextTrackSet = converted;
        for (let i = 0; i < nextTrackSet.length; i++) {
          const temp = nextTrackSet[i];
          nextTrackSet[i] = undefined;
          if (temp !== undefined) {
            return new Promise((resolve) => {
              resolve(temp);
            });
          }
        }
      } else {
        for (let i = 0; i < nextTrackSet.length; i++) {
          const temp = nextTrackSet[i];
          nextTrackSet[i] = undefined;
          if (temp !== undefined) {
            return new Promise((resolve) => {
              resolve(temp);
            });
          }
        }
      }
      return null;
    }));
  }

  async updatePlaylist(userId, delayInc = 0) {
    await sleep(delayInc * this.ONE_MIN * 5);

    this.logger.mostPlayed('Getting database items');
    this.logger.mostPlayed('Logging in to spotify');
    const memberInfo = {
      numTracks: await this.redis.hget(userId, `${this.type}:length`),
      refresh: await this.redis.hget(userId, 'refresh'),
      token: await this.redis.hget(userId, 'token'),
      oldPlaylist: await this.redis.hget(userId, `${this.type}:playlist`),
      lastFmId: await this.redis.hget(userId, `${this.type}:lastfm`),
      timespan: await this.redis.hget(userId, `${this.type}:period`)
    };
    if (!memberInfo.numTracks || !memberInfo.lastFmId || !memberInfo.timespan) return;
    const token = (await this.refreshToken(memberInfo.token, memberInfo.refresh));
    const newTokens = {
      token: token.access_token,
      refresh: token.refresh_token ? token.refresh_token : memberInfo.refresh
    };

    this.logger.mostPlayed('Setting new tokens');
    this.spotifyApi.setAccessToken(newTokens.token);
    this.spotifyApi.setRefreshToken(newTokens.refresh);

    this.logger.mostPlayed('logging in to lastfm');
    await this.lastfm.auth_getMobileSession();

    this.logger.mostPlayed('getting last.fm top tracks');
    const lastFmTrackList = await this.lastfm.user_getTopTracks({
      user: memberInfo.lastfmId,
      limit: Number(memberInfo.numTracks),
      period: memberInfo.timespan
    });

    this.logger.mostPlayed('converting to spotify and getting userinfo');
    const spotifyList = await this.convertToSpotify(lastFmTrackList.track, memberInfo.numTracks);
    const spotifyId = (await this.spotifyApi.getMe()).body.id;
    const trackList = await this.insertMissingTracks(
      spotifyList, memberInfo.lastFmId, memberInfo.timeSpan
    );

    this.logger.mostPlayed('sorting tracks, getting user, and preparing playlist');
    const newPlaylistId = await this.preparePlaylist(spotifyId, memberInfo.oldPlaylist);
    const sortedTracks = trackList.sort((a, b) => a.rank - b.rank);

    this.logger.mostPlayed('filling playlist');
    await this.fillPlaylist(spotifyId, newPlaylistId, sortedTracks);
    await this.redis.hset(userId, 'access', newTokens.token);
    await this.redis.hset(userId, 'refresh', newTokens.refresh);
    await this.redis.hset(userId, `${this.type}:playlist`, newPlaylistId);
  }
};