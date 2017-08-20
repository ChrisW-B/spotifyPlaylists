// react/actions/member.js
import { get } from './';
export const getMemberInfo = () => get(
  `/member/info`,
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
