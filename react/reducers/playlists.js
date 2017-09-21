// react/reducers/playlists.js
import { UPDATE_PLAYLISTS, UPDATE_MOST, TOGGLE_MOST, TOGGLE_RECENT, UPDATE_RECENT, LOGOUT, DELETE_ACCOUNT } from '../actionTypes';

const initialState = {
  mostPlayed: { enabled: false },
  recentlyAdded: { enabled: false }
};

export default (state = initialState, action = { info: {} }) => {
  if (!action.info) return { ...state };
  const { info: { member, updatePlaylist }, type } = action;
  switch (type) {
  case `${UPDATE_PLAYLISTS}_SUCCESS`:
    return { ...state, ...member };
  case `${UPDATE_MOST}_SUCCESS`:
  case `${TOGGLE_MOST}_SUCCESS`:
    return { ...state, mostPlayed: { ...state.mostPlayed, ...updatePlaylist.mostPlayed } };
  case `${UPDATE_RECENT}_SUCCESS`:
  case `${TOGGLE_RECENT}_SUCCESS`:
    return { ...state, recentlyAdded: { ...state.mostPlayed, ...updatePlaylist.recentlyAdded } };
  case `${LOGOUT}_SUCCESS`:
  case `${DELETE_ACCOUNT}_SUCCESS`:
    return { ...initialState };
  default:
    return { ...state };
  }
};