// react/containers/PlaylistsContainer.js

import { connect } from 'react-redux';
import { MainPage } from '../components';

const mapStateToProps = (state, ownProps) => ({
  member: state.member,
  mostPlayed: state.playlists.mostPlayed,
  recentlyAdded: state.playlists.recentlyAdded
});

export default connect(mapStateToProps)(MainPage);