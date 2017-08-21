const initialState = {
  mostPlayed: { enabled: false },
  recentlyAdded: { enabled: false }
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
  case 'UPDATE_PLAYLISTS_SUCCESS':
    return { ...state, ...action.info };
  case 'UPDATE_MOST_SUCCESS':
  case 'TOGGLE_MOST_SUCCESS':
    return { ...state, mostPlayed: { ...state.mostPlayed, ...action.info } };
  case 'UPDATE_RECENT_SUCCESS':
  case 'TOGGLE_RECENT_SUCCESS':
    return { ...state, recentlyAdded: { ...state.recentlyAdded, ...action.info } }
  case 'LOGOUT_SUCCESS':
  case 'DELETE_ACCOUNT_SUCCESS':
    return { ...initialState };

  default:
    return { ...state };
  }
};