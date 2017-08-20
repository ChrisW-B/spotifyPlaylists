// react/actions/member.js
import { get, del } from './';
export const getMemberInfo = () => get(
  `/member`,
  'MEMBER_INFO',
  (type, info) => ({
    type: `${type}_SUCCESS`,
    info,
    receivedAt: Date.now()
  })
);

export const logout = () => get(
  '/member/logout',
  'LOGOUT',
  (type) => ({
    type: `${type}_SUCCESS`,
    receivedAt: Date.now()
  })
);

export const deleteAccount = () => del(
  '/member',
  'DELETE_ACCOUNT',
  (type) => ({
    type: `${type}_SUCCESS`,
    receivedAt: Date.now()
  })
);
