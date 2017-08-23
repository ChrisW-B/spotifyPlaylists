// react/actions/playlists.js

import { get, post } from './';

const recieveData = (type, info) => ({
  type: `${type}_SUCCESS`,
  info,
  receivedAt: Date.now()
});
export const updatePlaylistStatus = () => get(
  `/playlists`,
  'UPDATE_PLAYLISTS',
  recieveData
);

export const toggleMostPlayed = (enable) =>
  post(
    `/playlists/most/toggle`,
    'TOGGLE_MOST', { enable },
    recieveData
  );

export const toggleRecentlyAdded = (enable) =>
  post(
    `/playlists/recent/toggle`,
    'TOGGLE_RECENT', { enable },
    recieveData
  );

export const updateMostPlayed = (settings) =>
  post(
    `/playlists/most/save`,
    'UPDATE_MOST',
    settings,
    recieveData
  );

export const updateRecentlyAdded = (settings) =>
  post(
    `/playlists/recent/save`,
    'UPDATE_RECENT',
    settings,
    recieveData
  );