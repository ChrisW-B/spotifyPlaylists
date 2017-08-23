// react/actions/playlists.js

import { get, post } from './';
export const updatePlaylistStatus = () => get(
  `/playlists`,
  'UPDATE_PLAYLISTS',
  (type, info) => ({
    type: `${type}_SUCCESS`,
    info,
    receivedAt: Date.now()
  })
);

export const togglePlaylist = (type, enable) => post(
  `/playlists/${type}/toggle`,
  type === 'most' ? 'TOGGLE_MOST' : 'TOGGLE_RECENT', { enable },
  (type, info) => ({
    type: `${type}_SUCCESS`,
    info,
    receivedAt: Date.now()
  })
);

export const updatePlaylistSettings = (type, settings) => post(
  `/playlists/${type}/save`,
  type === 'most' ? 'UPDATE_MOST' : 'UPDATE_RECENT',
  settings,
  (type, info) => ({
    type: `${type}_SUCCESS`,
    info,
    receivedAt: Date.now()
  })
);