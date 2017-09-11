// react/actions/index.js

export { get, post, del, put } from './async';
export loading from './loading';
export { getMemberInfo, logout, deleteAccount } from './member';
export {
  updatePlaylistStatus,
  toggleMostPlayed,
  toggleRecentlyAdded,
  updateMostPlayed,
  updateRecentlyAdded
}
from './playlists';
export { reloadRecent, reloadMost } from './admin';

export const receiveData = (type, info = {}) => ({
  type: `${type}_SUCCESS`,
  info,
  receivedAt: Date.now()
})