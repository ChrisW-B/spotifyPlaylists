// react/containers/HeaderContainer.js

import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Header } from '../components';
import { logout } from '../actions';

const mapStateToProps = ({ member, playlists }) => ({
  member,
  mostPlayed: playlists.mostPlayed,
  recentlyAdded: playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  openSettings: () => dispatch(push('/settings'))
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);