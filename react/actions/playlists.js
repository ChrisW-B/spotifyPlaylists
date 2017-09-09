// react/actions/playlists.js

import { get, post, receiveData } from './';

export const updatePlaylistStatus = () => get(
  `/playlists`,
  'UPDATE_PLAYLISTS',
  receiveData
);

export const toggleMostPlayed = (enable) =>
  post(
    `/playlists/most/toggle`,
    'TOGGLE_MOST', { enable },
    receiveData
  );

export const toggleRecentlyAdded = (enable) =>
  post(
    `/playlists/recent/toggle`,
    'TOGGLE_RECENT', { enable },
    receiveData
  );

export const updateMostPlayed = (settings) =>
  post(
    `/playlists/most/save`,
    'UPDATE_MOST',
    settings,
    receiveData
  );

export const updateRecentlyAdded = (settings) =>
  post(
    `/playlists/recent/save`,
    'UPDATE_RECENT',
    settings,
    receiveData
  );