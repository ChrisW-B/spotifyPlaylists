// react/actions/member.js

import { get, del, post, receiveData } from './';
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT } from '../actionTypes';

export const getMemberInfo = () =>
  get('/member', MEMBER_INFO, receiveData);

export const logout = () =>
  post('/member/logout', LOGOUT, {}, receiveData);

export const deleteAccount = () =>
  del('/member', DELETE_ACCOUNT, receiveData);