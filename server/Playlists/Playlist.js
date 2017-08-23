// server/Playlists/Playlist.js

const SpotifyWebApi = require('spotify-web-api-node'),
  ONE_MIN = 60 * 1000,
  ONE_SEC = 1000;

module.exports = class Playlist {
  constructor(logger, redis, spotifyData, type) {
    this.redis = redis;
    this.type = type;
    this.playListName = type === 'most' ? 'Most Played' : 'Recently Added';
    this.spotifyApi = new SpotifyWebApi(spotifyData);
    this.logger = logger;
    this.ONE_MIN = ONE_MIN;
    this.ONE_SEC = ONE_SEC;
  }
  //add list of spotify tracks to a playlist
  fillPlaylist(userId, playlistId, tracklist) {
    return this.spotifyApi.addTracksToPlaylist(userId, playlistId, tracklist.map(i => i.id));
  }

  async clearExistingPlaylist(userId, playlist) {
    // create an empty playlist
    if (playlist.tracks.total) {
      await this.spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, [...Array(playlist.tracks.total).keys()], playlist.snapshot_id);
    }
    return playlist.id;
  }

  foundOldPlaylist(playlists, oldPlaylist) {
    return playlists.findIndex(p => p.id === oldPlaylist);
  }

  async createNewPlaylist(userId) {
    return (await this.spotifyApi.createPlaylist(userId, this.playListName, {
      'public': false
    })).body.id;
  }

  async preparePlaylist(userId, oldPlaylistId, offset = 0) {
    const userPlaylists = (await this.spotifyApi.getUserPlaylists(userId, {
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

  async refreshToken(access, refresh) {
    //gets refresh token
    this.spotifyApi.setAccessToken(access);
    this.spotifyApi.setRefreshToken(refresh);
    return (await this.spotifyApi.refreshAccessToken()).body;
  }

  async update() {
    this.logger.playlist('Starting');
    const members = await this.redis.smembers('users');
    await Promise.all(members.map(async member => {
      const enabled = String(await this.redis.hget(member, this.type)).toLowerCase() === 'true';
      let delayInc = 0;
      try {
        return enabled ? this.updatePlaylist(member, delayInc++) : null;
      } catch (e) {
        this.logger.error(`Error!\n${JSON.stringify(e, null, 2)}`);
        setTimeout(() => this.update(), 5 * ONE_MIN);
      }
    }));
    this.logger.playlist('Done!');
  }
};