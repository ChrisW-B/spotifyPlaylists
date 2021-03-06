// react/reducers/loading.js

const initialState = {
  loadingState: {},
  loading: false,
  failed: false
};

export default (state = initialState, action = {}) => {
  if (!action.type) return state;
  const loadingState = { ...state.loadingState };
  let failed = state.failed || false;
  if (action.type.includes('_LOADING')) loadingState[action.type.replace('_LOADING', '')] = true;
  else if (action.type.includes('_SUCCESS')) delete loadingState[action.type.replace('_SUCCESS', '')];
  else if (action.type.includes('_FAIL')) {
    failed = true;
    delete loadingState[action.type.replace('_FAIL', '')];
  }
  return {
    ...state,
    loadingState,
    loading: Object.values(loadingState).reduce((a, i) => a || i, false),
    failed
  };
};