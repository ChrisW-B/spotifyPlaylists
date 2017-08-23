// react/containers/PlaylistsContainer.js

import { connect } from 'react-redux';
import { Playlists } from '../components';
import { updatePlaylistStatus, togglePlaylist, updatePlaylistSettings } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  mostPlayed: state.playlists.mostPlayed,
  recentlyAdded: state.playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  updatePlaylistStatus: () => dispatch(updatePlaylistStatus()),
  updateMostPlayedSettings: (settings) => dispatch(updatePlaylistSettings('most', settings)),
  updateRecentlyAddedSettings: (settings) => dispatch(updatePlaylistSettings('recent', settings)),
  toggleMostPlayed: (enable) => dispatch(togglePlaylist('most', enable)),
  toggleRecentlyAdded: (enable) => dispatch(togglePlaylist('recent', enable))
});

export default connect(mapStateToProps, mapDispatchToProps)(Playlists);