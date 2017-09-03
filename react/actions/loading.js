// react/actions/loading.js

export default (type, state = {}) => ({
  ...state,
  type: `${type}_LOADING`
});