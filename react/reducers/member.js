// react/reducers/member.js
import { MEMBER_INFO, LOGOUT, DELETE_ACCOUNT } from '../actionTypes';

const initialState = {
  spotifyId: '',
  isAdmin: false
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
  case `${MEMBER_INFO}_SUCCESS`:
    return { ...state, ...action.info.member };
  case `${LOGOUT}_SUCCESS`:
  case `${DELETE_ACCOUNT}_SUCCESS`:
    return { ...initialState };
  default:
    return { ...state };
  }
};