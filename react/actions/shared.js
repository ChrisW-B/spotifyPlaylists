// react/actions/shared.js

export const loading = (type, state = {}) => ({
  ...state,
  type: `${type}_LOADING`
});

export const receiveData = (type, info = {}) => ({
  type: `${type}_SUCCESS`,
  info,
  receivedAt: Date.now()
})