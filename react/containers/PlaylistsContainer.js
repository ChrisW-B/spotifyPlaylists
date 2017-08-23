// react/containers/PlaylistsContainer.js

import { connect } from 'react-redux';
import { Playlists } from '../components';
import { updatePlaylistStatus, toggleMostPlayed, toggleRecentlyAdded, updateMostPlayed, updateRecentlyAdded } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  mostPlayed: state.playlists.mostPlayed,
  recentlyAdded: state.playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  updatePlaylistStatus: () => dispatch(updatePlaylistStatus()),
  updateMostPlayed: (settings) => dispatch(updateMostPlayed(settings)),
  updateRecentlyAdded: (settings) => dispatch(updateRecentlyAdded(settings)),
  toggleMostPlayed: (enable) => dispatch(toggleMostPlayed(enable)),
  toggleRecentlyAdded: (enable) => dispatch(toggleRecentlyAdded(enable))
});

export default connect(mapStateToProps, mapDispatchToProps)(Playlists);