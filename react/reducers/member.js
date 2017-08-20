const initialState = {
  id: '',
  username: '',
  displayName: '',
  isAdmin: false,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
  case 'MEMBER_INFO_SUCCESS':
    return { ...state, ...action.info };
  case 'LOGOUT_SUCCESS':
  case 'DELETE_ACCOUNT_SUCCESS':
    return { ...initialState };

  default:
    return { ...state };
  }
}