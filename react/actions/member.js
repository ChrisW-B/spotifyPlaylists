// react/actions/member.js

import { graphQL, receiveData } from './';
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT } from '../actionTypes';

export const getMemberInfo = () =>
  graphQL(MEMBER_INFO, receiveData, '{member{spotifyId isAdmin photo}}');

export const logout = () =>
  graphQL(LOGOUT, receiveData, 'mutation{logout{success}}');

export const deleteAccount = () =>
  graphQL(DELETE_ACCOUNT, receiveData, 'mutation{deleteAccount{success}}');