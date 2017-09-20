// react/actions/member.js

import { graphQL, del, post, receiveData } from './';
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT } from '../actionTypes';

const query = `
{
  member {
    spotifyId
    isAdmin
    photo
  }
}
`;
export const getMemberInfo = () =>
  graphQL(
    MEMBER_INFO,
    query,
    receiveData
  );

export const logout = () =>
  post('/member/logout', LOGOUT, {}, receiveData);

export const deleteAccount = () =>
  del('/member', DELETE_ACCOUNT, receiveData);