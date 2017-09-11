// react/reducers/playlists.js
import { UPDATE_PLAYLISTS, UPDATE_MOST, TOGGLE_MOST, TOGGLE_RECENT, UPDATE_RECENT, LOGOUT, DELETE_ACCOUNT } from '../constants';

const initialState = {
  mostPlayed: { enabled: false },
  recentlyAdded: { enabled: false }
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
  case `${UPDATE_PLAYLISTS}_SUCCESS`:
    return { ...state, ...action.info };
  case `${UPDATE_MOST}_SUCCESS`:
  case `${TOGGLE_MOST}_SUCCESS`:
    return { ...state, mostPlayed: { ...state.mostPlayed, ...action.info } };
  case `${UPDATE_RECENT}_SUCCESS`:
  case `${TOGGLE_RECENT}_SUCCESS`:
    return { ...state, recentlyAdded: { ...state.recentlyAdded, ...action.info } };
  case `${LOGOUT}_SUCCESS`:
  case `${DELETE_ACCOUNT}_SUCCESS`:
    return { ...initialState };

  default:
    return { ...state };
  }
};