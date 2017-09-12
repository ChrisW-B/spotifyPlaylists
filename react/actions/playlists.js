// react/actions/playlists.js

import { get, post, receiveData } from './';
import { UPDATE_PLAYLISTS, TOGGLE_MOST, TOGGLE_RECENT, UPDATE_MOST, UPDATE_RECENT } from '../actionTypes';

export const updatePlaylistStatus = () =>
  get(
    `/playlists`,
    UPDATE_PLAYLISTS,
    receiveData
  );

export const toggleMostPlayed = (enable) =>
  post(
    `/playlists/most/toggle`,
    TOGGLE_MOST, { enable },
    receiveData
  );

export const toggleRecentlyAdded = (enable) =>
  post(
    `/playlists/recent/toggle`,
    TOGGLE_RECENT, { enable },
    receiveData
  );

export const updateMostPlayed = (settings) =>
  post(
    `/playlists/most/save`,
    UPDATE_MOST,
    settings,
    receiveData
  );

export const updateRecentlyAdded = (settings) =>
  post(
    `/playlists/recent/save`,
    UPDATE_RECENT,
    settings,
    receiveData
  );