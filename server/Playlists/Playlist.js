// server/Playlists/Playlist.js

const SpotifyWebApi = require('spotify-web-api-node');

const ONE_MIN = 60 * 1000;
const ONE_SEC = 1000;

module.exports = class Playlist {
  constructor(logger, Member, spotifyData) {
    this.Member = Member;
    this.spotifyApi = new SpotifyWebApi(spotifyData);
    this.logger = logger;
    this.ONE_MIN = ONE_MIN;
    this.ONE_SEC = ONE_SEC;
  }

  // add list of spotify tracks to a playlist
  fillPlaylist(userId, playlistId, tracklist) {
    return this.spotifyApi.addTracksToPlaylist(userId, playlistId, tracklist.map(i => i.id));
  }

  async clearExistingPlaylist(userId, playlist) {
    // create an empty playlist
    if (playlist.tracks.total) {
      await this.spotifyApi.removeTracksFromPlaylistByPosition(
        userId, playlist.id, [...Array(playlist.tracks.total).keys()], playlist.snapshot_id
      );
    }
    return playlist.id;
  }

  foundOldPlaylist(playlists, oldPlaylist) {
    this.log('searching for old playlist');
    return playlists.findIndex(p => p.id === oldPlaylist);
  }

  async createNewPlaylist(userId, name) {
    return (await this.spotifyApi.createPlaylist(userId, name, {
      public: false
    })).body.id;
  }

  async preparePlaylist(userId, oldPlaylistId, name, offset = 0) {
    const userPlaylists = (await this.spotifyApi.getUserPlaylists(userId, {
      limit: 20,
      offset
    })).body;
    const playlistLoc = this.foundOldPlaylist(userPlaylists.items, oldPlaylistId);
    if (playlistLoc > -1) {
      return this.clearExistingPlaylist(userId, userPlaylists.items[playlistLoc]);
    } else if (userPlaylists.next == null) {
      return this.createNewPlaylist(userId, name);
    }
    return this.preparePlaylist(userId, oldPlaylistId, name, offset + 20);
  }

  async refreshToken(access, refresh) {
    // gets refresh token
    this.spotifyApi.setAccessToken(access);
    this.spotifyApi.setRefreshToken(refresh);
    return (await this.spotifyApi.refreshAccessToken()).body;
  }

  async signInToSpotify({ accessToken, refreshToken }) {
    const {
      access_token, // eslint-disable-line camelcase
      refresh_token = refreshToken // eslint-disable-line camelcase
    } = await this.refreshToken(accessToken, refreshToken);
    this.spotifyApi.setAccessToken(access_token);
    this.spotifyApi.setRefreshToken(refresh_token);
    return { accessToken: access_token, refreshToken: refresh_token };
  }

  async update() {
    this.log('Starting');
    const members = await this.Member.find().exec();
    await Promise.all(members.map(async (member) => {
      let delayInc = 0;
      try {
        return this.isEnabled(member) ? this.updatePlaylist(member, delayInc++) : null;
      } catch (e) {
        this.log(`Error!\n${JSON.stringify(e, null, 2)}`);
        return setTimeout(() => this.update(), 5 * ONE_MIN);
      }
    }));
    this.log('Done!');
  }
};