// server/Playlists/recentlyAdded.js

const sleep = require('sleep-promise');
const Playlist = require('./Playlist');

module.exports = class RecentlyAdded extends Playlist {
  constructor(logger, Member, spotifyData) {
    super(logger, Member, spotifyData);
    this.playListName = 'Recently Added';
  }

  log(s) {
    this.logger.recentlyAdded(s);
  }

  isEnabled(member) {
    this.log(`${member.spotifyId} Most Played is ${member.recentlyAdded.enabled ? 'en' : 'dis'}abled`);
    return member.recentlyAdded.enabled;
  }

  createTrackListArray(tracks) {
    this.log('mapping tracks');
    return tracks.map(t => t.track.uri);
  }

  async updatePlaylist(member, delayInc = 0) {
    const newMember = member;
    await sleep(delayInc * this.ONE_MIN * 5);
    const { id, length } = member.recentlyAdded;

    if (!length) return;

    this.log('Logging in to spotify');
    const { accessToken, refreshToken } = await this.signInToSpotify(member);
    newMember.accessToken = accessToken;
    newMember.refreshToken = refreshToken;

    this.log('Getting user info');
    const {
      body: { id: spotifyId },
    } = await this.spotifyApi.getMe();

    this.log('preparing playlist and getting saved tracks');
    newMember.recentlyAdded.id = await this.preparePlaylist(spotifyId, id, this.playListName);
    const savedTracks = (await this.spotifyApi.getMySavedTracks({ limit: length })).body;

    this.log('filling playlist');
    const spotifyUris = this.createTrackListArray(savedTracks.items);
    await this.spotifyApi.addTracksToPlaylist(spotifyId, newMember.recentlyAdded.id, spotifyUris);

    this.log('Updating database');
    await newMember.save();
  }
};