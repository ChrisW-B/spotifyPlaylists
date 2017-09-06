// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Header } from '../components';
import { logout, deleteAccount } from '../actions';

// const mapStateToProps = ({ member, playlists }) => ({
//   member,
//   mostPlayed: playlists.mostPlayed,
//   recentlyAdded: playlists.recentlyAdded
// });

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  deleteAccount: () => dispatch(deleteAccount)
});

export default connect({}, mapDispatchToProps)(Header);