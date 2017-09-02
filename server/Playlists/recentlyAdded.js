// server/Playlists/recentlyAdded.js

'use strict';

const sleep = require('sleep-promise'),
  Playlist = require('./Playlist');

module.exports = class RecentlyAdded extends Playlist {
  constructor(logger, redis, spotifyData) {
    super(logger, redis, spotifyData, 'recent');
    this.redis = redis;
  }

  createTrackListArray(recentlyAdded) {
    // picks out the rmemberInfovent data from the Recently Added songs list
    return recentlyAdded.map(t => t.track.uri);
  }

  async updatePlaylist(userId, delayInc = 0) {
    await sleep(delayInc * this.ONE_MIN * 5);

    this.logger.recentlyAdded('Getting database items');
    const memberInfo = {
      numTracks: await this.redis.hget(userId, `${this.type}:length`),
      refresh: await this.redis.hget(userId, 'refresh'),
      token: await this.redis.hget(userId, 'token'),
      oldPlaylist: await this.redis.hget(userId, `${this.type}:playlist`)
    };

    this.logger.recentlyAdded('Logging in to spotify');
    const token = (await this.refreshToken(memberInfo.token, memberInfo.refresh)),
      newTokens = {
        token: token.access_token,
        refresh: token.refresh_token ? token.refresh_token : memberInfo.refresh
      };
    this.spotifyApi.setAccessToken(newTokens.token);
    this.spotifyApi.setRefreshToken(newTokens.refresh);

    this.logger.recentlyAdded('Getting user info');
    const userInfo = await this.spotifyApi.getMe();

    this.logger.recentlyAdded('preparing playlist and getting saved tracks');
    const newPlaylistId = await this.preparePlaylist(userInfo.body.id, memberInfo.oldPlaylist),
      savedTracks = (await this.spotifyApi.getMySavedTracks({
        limit: memberInfo.numTracks
      })).body,
      spotifyId = userInfo.body.id;

    this.logger.recentlyAdded('filling playlist');
    const spotifyUris = this.createTrackListArray(savedTracks.items);
    await this.spotifyApi.addTracksToPlaylist(spotifyId, newPlaylistId, spotifyUris);

    this.logger.recentlyAdded('Updating database');
    await Promise.all([
      this.redis.hset(userId, 'access', newTokens.token),
      this.redis.hset(userId, 'refresh', newTokens.refresh),
      this.redis.hset(userId, `${this.type}:playlist`, newPlaylistId)
    ]);
  }
};