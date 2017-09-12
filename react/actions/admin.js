// react/actions/admin.js
import { post, receiveData } from './';
import { ADMIN_MOST, ADMIN_RECENT } from '../actionTypes';

export const reloadMost = () =>
  post(
    `/admin/forceMost`,
    ADMIN_MOST,
    receiveData
  );

export const reloadRecent = () =>
  post(
    `/admin/forceRecent`,
    ADMIN_RECENT,
    receiveData
  );