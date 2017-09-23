// react/actions/playlists.js

import { graphQL, receiveData } from './';
import { UPDATE_PLAYLISTS, TOGGLE_MOST, TOGGLE_RECENT, UPDATE_MOST, UPDATE_RECENT } from '../actionTypes';

export const updatePlaylistStatus = () =>
  graphQL(UPDATE_PLAYLISTS, receiveData, '{member{mostPlayed{lastfm enabled period length}recentlyAdded{enabled length}}}', );

export const toggleMostPlayed = (enable) =>
  graphQL(TOGGLE_MOST, receiveData, `mutation{updatePlaylist(playlistKind:mostPlayed patch:{enabled:${enable}}){mostPlayed{enabled}}}`);

export const toggleRecentlyAdded = (enable) =>
  graphQL(TOGGLE_RECENT, receiveData, `mutation{updatePlaylist(playlistKind:recentlyAdded patch:{enabled:${enable}}){recentlyAdded{enabled}}}`);

export const updateMostPlayed = (settings) =>
  graphQL(UPDATE_MOST, receiveData, `mutation updateMostPlayed($settings: updatePlaylistType!){updatePlaylist(playlistKind:mostPlayed patch:$settings){mostPlayed{lastfm enabled period length}}}`, { settings });

export const updateRecentlyAdded = (settings) =>
  graphQL(UPDATE_RECENT, receiveData, `mutation updateRecentlyAdded($settings: updatePlaylistType!){updatePlaylist(playlistKind:recentlyAdded patch:$settings){recentlyAdded{enabled length}}}`, { settings });