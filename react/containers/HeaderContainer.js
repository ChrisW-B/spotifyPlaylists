// react/containers/HeaderContainer.js

import { connect } from 'react-redux';
import { push, goBack } from 'react-router-redux';
import { Header } from '../components';
import { logout } from '../actions';

const mapStateToProps = ({ member, playlists, routing }) => ({
  photos: member.photos,
  id: member.id,
  username: member.username,
  mostPlayed: playlists.mostPlayed,
  recentlyAdded: playlists.recentlyAdded,
  pathname: routing.location.pathname //so the thing actually updates on route changes
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  openSettings: () => dispatch(push('/settings')),
  back: () => dispatch(goBack())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);