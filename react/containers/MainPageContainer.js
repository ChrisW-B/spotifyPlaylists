// react/containers/PlaylistsContainer.js

import { connect } from 'react-redux';
import { MainPage } from '../components';
import { getMemberInfo } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  member: state.member,
  mostPlayed: state.playlists.mostPlayed,
  recentlyAdded: state.playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  getMemberInfo: () => dispatch(getMemberInfo())
});

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);