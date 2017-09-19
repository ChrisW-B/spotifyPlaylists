// server/Playlists/recentlyAdded.js
const sleep = require('sleep-promise');
const Playlist = require('./Playlist');

module.exports = class RecentlyAdded extends Playlist {
  constructor(logger, db, spotifyData) {
    super(logger, db, spotifyData, 'recent');
  }

  createTrackListArray(tracks) {
    this.logger.recentlyAdded('mapping tracks');
    return tracks.map(t => t.track.uri);
  }

  async updatePlaylist(member, delayInc = 0) {
    await sleep(delayInc * this.ONE_MIN * 5);
    const { id, length } = member.recentlyAdded;

    this.logger.recentlyAdded('Logging in to spotify');
    const {
      access_token,
      refresh_token = member.refreshToken
    } = await this.refreshToken(member.accessToken, member.refreshToken);
    this.spotifyApi.setAccessToken(access_token);
    this.spotifyApi.setRefreshToken(refresh_token);

    this.logger.recentlyAdded('Getting user info');
    const userInfo = await this.spotifyApi.getMe();

    this.logger.recentlyAdded('preparing playlist and getting saved tracks');
    const newPlaylistId = await this.preparePlaylist(userInfo.body.id, id);
    const savedTracks = (await this.spotifyApi.getMySavedTracks({
      limit: length
    })).body;
    const spotifyId = userInfo.body.id;

    this.logger.recentlyAdded('filling playlist');
    const spotifyUris = this.createTrackListArray(savedTracks.items);
    await this.spotifyApi.addTracksToPlaylist(spotifyId, newPlaylistId, spotifyUris);

    this.logger.recentlyAdded('Updating database');
    await this.db.findAndModify({
      query: { _id: member._id },
      update: { $set: { accessToken: access_token, refreshToken: refresh_token, 'mostPlayed.id': newPlaylistId } }
    });
  }
};