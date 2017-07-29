'use strict';

const Lastfm = require('lastfm-njs'),
  SpotifyWebApi = require('spotify-web-api-node'),
  sleep = require('sleep-promise'),
  config = require('./config'),
  logger = process.console,
  lastfm = new Lastfm({
    apiKey: config.lastfm.token,
    apiSecret: config.lastfm.secret,
    username: config.lastfm.username,
    password: config.lastfm.password
  }),
  spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri
  });

const MostPlayed = function (redis) {
  const ONE_SEC = 1000,
    ONE_MIN = 60 * ONE_SEC,
    self = this;

  // takes list of last.fm tracks and tries to find them in spotify
  self.convertToSpotify = topTracks =>
    Promise.all(topTracks.map((ele, i) =>
      new Promise(async resolve => {
        await sleep(ONE_SEC / 2 * i);
        logger.time().tag('Most Played').file().backend(`Searching for \n${ele.name} by ${ele.artist.name}`);
        const results = (await spotifyApi.searchTracks(`track:${ele.name} artist:${ele.artist.name}`))
          .body.tracks.items;
        if (results.length > 0 && results[0].uri) {
          resolve({
            id: results[0].uri,
            rank: ele['@attr'].rank
          });
        } else {
          logger.time().tag('Most Played').file().warning(`couldn't find ${ele.name} by ${ele.artist.name}`);
          resolve(undefined);
        }
      })
    ));

  //add list of spotify tracks to a playlist
  self.fillPlaylist = (userId, playlistId, tracklist) =>
    spotifyApi.addTracksToPlaylist(userId, playlistId, tracklist.map(i => i.id));


  self.clearExistingPlaylist = async(userId, playlist) => {
    // create an empty playlist
    if (playlist.tracks.total > 0) {
      await spotifyApi.removeTracksFromPlaylistByPosition(userId, playlist.id, [...Array(playlist.tracks.total).keys()], playlist.snapshot_id);
    }
    return playlist.id;
  };

  self.foundOldPlaylist = (playlists, oldPlaylist) =>
    playlists.findIndex(p => p.id === oldPlaylist);


  self.createNewPlaylist = async userId =>
    (await spotifyApi.createPlaylist(userId, 'Most Played', {
      'public': false
    })).body.id;


  self.preparePlaylist = async(userId, oldPlaylistId, offset = 0) => {
    const userPlaylists = (await spotifyApi.getUserPlaylists(userId, {
      limit: 20,
      offset: offset
    })).body;
    const playlistLoc = self.foundOldPlaylist(userPlaylists.items, oldPlaylistId);
    if (playlistLoc > -1) {
      return self.clearExistingPlaylist(userId, userPlaylists.items[playlistLoc]);
    } else if (userPlaylists.next == null) {
      return self.createNewPlaylist(userId);
    } else {
      return self.preparePlaylist(userId, oldPlaylistId, offset + 20);
    }
  };

  self.insertMissingTracks = (trackList, lastFmId, period) => {
    let nextTrackSet;
    return Promise.all(trackList.map(async(ele) => {
      if (ele !== undefined) {
        return new Promise(resolve => {
          resolve(ele);
        });
      } else {
        if (nextTrackSet === undefined) {
          const topTracks = (await lastfm.user_getTopTracks({
            user: lastFmId,
            limit: trackList.length,
            period: period,
            page: 2
          })).track;

          const converted = self.convertToSpotify(topTracks);
          nextTrackSet = converted;
          for (let i = 0; i < nextTrackSet.length; i++) {
            const temp = nextTrackSet[i];
            nextTrackSet[i] = undefined;
            if (temp !== undefined) {
              return new Promise(resolve => {
                resolve(temp);
              });
            }
          }

        } else {
          for (let i = 0; i < nextTrackSet.length; i++) {
            const temp = nextTrackSet[i];
            nextTrackSet[i] = undefined;
            if (temp !== undefined) {
              return new Promise(resolve => {
                resolve(temp);
              });
            }
          }
        }
      }
    }));
  };

  self.refreshToken = async(access, refresh) => {
    //gets refresh token
    spotifyApi.setAccessToken(access);
    spotifyApi.setRefreshToken(refresh);
    return (await spotifyApi.refreshAccessToken()).body;
  };


  self.updatePlaylist = async(userId, delayInc = 0) => {
    await sleep(delayInc * ONE_MIN * 5);

    logger.time().tag('Most Played').file().backend('Getting database items');
    const memberInfo = {
      numTracks: await redis.hget(userId, 'most:length'),
      refresh: await redis.hget(userId, 'refresh'),
      token: await redis.hget(userId, 'token'),
      oldPlaylist: await redis.hget(userId, 'most:playlist'),
      lastFmId: await redis.hget(userId, 'most:lastfm'),
      timespan: await redis.hget(userId, 'most:period')
    };

    logger.time().tag('Most Played').file().backend('Logging in to spotify');
    const token = (await self.refreshToken(memberInfo.token, memberInfo.refresh));
    const newTokens = {
      token: token.access_token,
      refresh: token.refresh_token ? token.refresh_token : memberInfo.refresh
    };

    logger.time().tag('Most Played').file().backend('Setting new tokens');
    spotifyApi.setAccessToken(newTokens.token);
    spotifyApi.setRefreshToken(newTokens.refresh);

    logger.time().tag('Most Played').file().backend('logging in to lastfm');
    await lastfm.auth_getMobileSession();

    logger.time().tag('Most Played').file().backend('getting last.fm top tracks');
    const lastFmTrackList = await lastfm.user_getTopTracks({
      user: memberInfo.lastfmId,
      limit: Number(memberInfo.numTracks),
      period: memberInfo.timespan
    });

    logger.time().tag('Most Played').file().backend('converting to spotify and getting userinfo');
    const spotifyList = await self.convertToSpotify(lastFmTrackList.track, memberInfo.numTracks);
    const spotifyId = (await spotifyApi.getMe()).body.id;
    const trackList = await self.insertMissingTracks(spotifyList, memberInfo.lastFmId, memberInfo.timeSpan);

    logger.time().tag('Most Played').file().backend('sorting tracks, getting user, and preparing playlist');
    const newPlaylistId = await self.preparePlaylist(spotifyId, memberInfo.oldPlaylist);
    const sortedTracks = trackList.sort((a, b) => a.rank - b.rank);

    logger.time().tag('Most Played').file().backend('filling playlist');
    await self.fillPlaylist(spotifyId, newPlaylistId, sortedTracks);
    await redis.hset(userId, 'access', newTokens.token);
    await redis.hset(userId, 'refresh', newTokens.refresh);
    await redis.hset(userId, 'most:playlist', newPlaylistId);
  };

  self.start = async() => {
    logger.time().tag('Most Played').file().info('Starting');
    const members = await redis.smembers('users');
    await Promise.all(members.map(async member => {
      const enabled = String(await redis.hget(member, 'most')).toLowerCase() === 'true';
      let delayInc = 0;
      return enabled ? self.updatePlaylist(member, delayInc++) : null;
    }));
    logger.time().tag('Most Played').file().backend('Done!');
  };
};

module.exports = MostPlayed;