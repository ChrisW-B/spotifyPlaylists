// server/Playlists/mostPlayed.js
const Lastfm = require('lastfm-njs');
const sleep = require('sleep-promise');
const Playlist = require('./Playlist');

module.exports = class MostPlayed extends Playlist {
  constructor(logger, db, spotifyData, lastFmData) {
    super(logger, db, spotifyData, 'most');
    this.lastfm = new Lastfm(lastFmData);
  }

  // takes list of last.fm tracks and tries to find them in spotify
  convertToSpotify(topTracks) {
    return Promise.all(topTracks.map((ele, i) =>
      new Promise(async (resolve) => {
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
    return Promise.all(trackList.map(async (ele) => {
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

  async updatePlaylist(member, delayInc = 0) {
    await sleep(delayInc * this.ONE_MIN * 5);
    const { length, lastfm, period, id } = member.mostPlayed;
    if (!length || !lastfm || !period) return;

    this.logger.recentlyAdded('Logging in to spotify');
    const {
      access_token,
      refresh_token = member.refreshToken // eslint-disable-line camelcase
    } = await this.refreshToken(member.accessToken, member.refreshToken);
    this.spotifyApi.setAccessToken(access_token);
    this.spotifyApi.setRefreshToken(refresh_token);

    this.logger.mostPlayed('logging in to lastfm');
    await this.lastfm.auth_getMobileSession();

    this.logger.mostPlayed('getting last.fm top tracks');
    const lastFmTrackList =
      await this.lastfm.user_getTopTracks({ user: lastfm, limit: +length, period });

    this.logger.mostPlayed('converting to spotify and getting userinfo');
    const spotifyList = await this.convertToSpotify(lastFmTrackList.track, length);
    const spotifyId = (await this.spotifyApi.getMe()).body.id;
    const trackList = await this.insertMissingTracks(spotifyList, lastfm, period);

    this.logger.mostPlayed('sorting tracks, getting user, and preparing playlist');
    const newPlaylistId = await this.preparePlaylist(spotifyId, id);
    const sortedTracks = trackList.sort((a, b) => a.rank - b.rank);

    this.logger.mostPlayed('filling playlist');
    await this.fillPlaylist(spotifyId, newPlaylistId, sortedTracks);
    await this.db.findAndModify({
      query: { _id: member._id }, // eslint-disable-line no-underscore-dangle
      update: { $set: { accessToken: access_token, refreshToken: refresh_token, 'mostPlayed.id': newPlaylistId } }
    });
  }
};