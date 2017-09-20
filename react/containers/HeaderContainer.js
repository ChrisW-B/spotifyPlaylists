// react/containers/HeaderContainer.js

import { connect } from 'react-redux';
import { push, goBack } from 'react-router-redux';
import { Header } from '../components';
import { logout } from '../actions';

const mapStateToProps = ({ member, playlists, routing }) => ({
  photo: member.photo,
  isAdmin: member.isAdmin,
  spotifyId: member.spotifyId,
  mostPlayed: playlists.mostPlayed,
  recentlyAdded: playlists.recentlyAdded,
  pathname: routing.location.pathname //so the thing actually updates on route changes
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  openSettings: () => dispatch(push('/settings')),
  back: () => dispatch(goBack()),
  goHome: () => dispatch(push('/')),
  openAdmin: () => dispatch(push('/admin'))
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);