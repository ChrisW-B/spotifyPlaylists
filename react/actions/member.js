// react/actions/member.js

import { get, del, receiveData } from './';
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT } from '../constants';

export const getMemberInfo = () => get(
  `/member`,
  MEMBER_INFO,
  receiveData
);

export const logout = () => get(
  '/member/logout',
  LOGOUT,
  receiveData
);

export const deleteAccount = () => del(
  '/member',
  DELETE_ACCOUNT,
  receiveData
);