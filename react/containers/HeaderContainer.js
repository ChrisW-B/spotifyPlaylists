// react/containers/HeaderContainer.js

import { connect } from 'react-redux';
import  Header  from '../components/Header';
import { logout, deleteAccount } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  member: state.member,
  mostPlayed: state.playlists.mostPlayed,
  recentlyAdded: state.playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  deleteAccount: () => dispatch(deleteAccount())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);