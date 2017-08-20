// react/actions/loading.js
export const loading = (type, state = {}) => ({
  ...state,
  type: `${type}_LOADING`
});