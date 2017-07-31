'use strict';

const sleep = require('sleep-promise'),
  Playlist = require('./Playlist');

module.exports = class RecentlyAdded extends Playlist {
  constructor(redis) {
    super(redis, 'recent');
    this.redis = redis;
  }

  createTrackListArray(recentlyAdded) {
    // picks out the rmemberInfovent data from the Recently Added songs list
    return recentlyAdded.map(t => t.track.uri);
  }

  async updatePlaylist(userId, delayInc = 0) {
    await sleep(delayInc * this.ONE_MIN * 5);
    this.logger.time().tag(this.playListName).file().backend('Getting database items');
    const memberInfo = {
      numTracks: await this.redis.hget(userId, `${this.type}:length`),
      refresh: await this.redis.hget(userId, 'refresh'),
      token: await this.redis.hget(userId, 'token'),
      oldPlaylist: await this.redis.hget(userId, `${this.type}:playlist`)
    };

    this.logger.time().tag(this.playListName).file().backend('Logging in to spotify');
    const token = (await this.refreshToken(memberInfo.token, memberInfo.refresh));
    const newTokens = {
      token: token.access_token,
      refresh: token.refresh_token ? token.refresh_token : memberInfo.refresh
    };
    this.spotifyApi.setAccessToken(newTokens.token);
    this.spotifyApi.setRefreshToken(newTokens.refresh);

    this.logger.time().tag(this.playListName).file().time().backend('Getting user info');
    const userInfo = await this.spotifyApi.getMe();

    this.logger.time().tag(this.playListName).file().backend('preparing playlist and getting saved tracks');
    const newPlaylistId = await this.preparePlaylist(userInfo.body.id, memberInfo.oldPlaylist),
      savedTracks = (await this.spotifyApi.getMySavedTracks({
        limit: memberInfo.numTracks
      })).body,
      spotifyId = userInfo.body.id;

    this.logger.time().tag(this.playListName).file().backend('filling playlist');
    const spotifyUris = this.createTrackListArray(savedTracks.items);
    await this.spotifyApi.addTracksToPlaylist(spotifyId, newPlaylistId, spotifyUris);

    this.logger.time().tag(this.playListName).file().backend('Updating database');
    await Promise.all([
      this.redis.hset(userId, 'access', newTokens.token),
      this.redis.hset(userId, 'refresh', newTokens.refresh),
      this.redis.hset(userId, `${this.type}:playlist`, newPlaylistId)
    ]);
  }
};