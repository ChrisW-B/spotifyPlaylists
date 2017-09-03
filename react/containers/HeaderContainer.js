// react/containers/HeaderContainer.js

import { connect } from 'react-redux';
import { Header } from '../components';
import { logout, deleteAccount } from '../actions';

const mapStateToProps = state => ({
  memberId: state.member.id,
  mostPlayed: state.playlists.mostPlayed,
  recentlyAdded: state.playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  deleteAccount: () => dispatch(deleteAccount())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);