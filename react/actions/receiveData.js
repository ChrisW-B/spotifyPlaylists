// react/actions/receiveData.js

export default (type, info = {}) => ({
  type: `${type}_SUCCESS`,
  info,
  receivedAt: Date.now()
})