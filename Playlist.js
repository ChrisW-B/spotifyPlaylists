const SpotifyWebApi = require('spotify-web-api-node'),
  config = require('./config'),
  logger = process.console,
  spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri
  });

module.exports = class Playlist {
  constructor(redis, type) {
    this.redis = redis;
    this.type = type;
    this.playListName = type === 'most' ? 'Most Played' : 'Recently Added';
    this.spotifyApi = spotifyApi;
  }
  //add list of spotify tracks to a playlist
  fillPlaylist(userId, playlistId, tracklist) {
    return spotifyApi.addTracksToPlaylist(userId, playlistId, tracklist.map(i => i.id));
  }

  async clearExistingPlaylist(userId, playlist) {
    // create an empty playlist
    if (playlist.tracks.total) {
      await spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, [...Array(playlist.tracks.total).keys()], playlist.snapshot_id);
    }
    return playlist.id;
  }

  foundOldPlaylist(playlists, oldPlaylist) {
    return playlists.findIndex(p => p.id === oldPlaylist);
  }

  async createNewPlaylist(userId) {
    return (await spotifyApi.createPlaylist(userId, this.playListName, {
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

  async refreshToken(access, refresh) {
    //gets refresh token
    spotifyApi.setAccessToken(access);
    spotifyApi.setRefreshToken(refresh);
    return (await spotifyApi.refreshAccessToken()).body;
  }

  async start() {
    logger.time().tag(this.playListName).file().info('Starting');
    const members = await this.redis.smembers('users');
    await Promise.all(members.map(async member => {
      console.log(this.type)
      const enabled = String(await this.redis.hget(member, this.type)).toLowerCase() === 'true';
      let delayInc = 0;
      return enabled ? this.updatePlaylist(member, delayInc++) : null;
    }));
    logger.time().tag(this.playListName).file().backend('Done!');
  }
};