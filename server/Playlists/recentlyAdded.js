// server/Playlists/recentlyAdded.js

const sleep = require('sleep-promise');
const Playlist = require('./Playlist');

module.exports = class RecentlyAdded extends Playlist {
  constructor(logger, Member, spotifyData) {
    super(logger, Member, spotifyData, 'recent');
  }

  createTrackListArray(tracks) {
    this.logger.recentlyAdded('mapping tracks');
    return tracks.map(t => t.track.uri);
  }

  async updatePlaylist(member, delayInc = 0) {
    const newMember = member;
    await sleep(delayInc * this.ONE_MIN * 5);
    const { id, length } = member.recentlyAdded;

    this.logger.recentlyAdded('Logging in to spotify');
    const { accessToken, refreshToken } = await this.signInToSpotify(member);
    newMember.accessToken = accessToken;
    newMember.refreshToken = refreshToken;

    this.logger.recentlyAdded('Getting user info');
    const { body: { id: spotifyId } } = await this.spotifyApi.getMe();

    this.logger.recentlyAdded('preparing playlist and getting saved tracks');
    newMember.recentlyAdded.id = await this.preparePlaylist(spotifyId, id);
    const savedTracks = (await this.spotifyApi.getMySavedTracks({ limit: length })).body;

    this.logger.recentlyAdded('filling playlist');
    const spotifyUris = this.createTrackListArray(savedTracks.items);
    await this.spotifyApi.addTracksToPlaylist(spotifyId, newMember.recentlyAdded.id, spotifyUris);

    this.logger.recentlyAdded('Updating database');
    await newMember.save();
  }
};