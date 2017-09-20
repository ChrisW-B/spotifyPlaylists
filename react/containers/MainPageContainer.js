// react/containers/MainPageContainer.js

import { connect } from 'react-redux';
import { MainPage } from '../components';
import { getMemberInfo } from '../actions';

const mapStateToProps = ({ member, playlists }) => ({
  spotifyId: member.spotifyId,
  mostPlayed: playlists.mostPlayed,
  recentlyAdded: playlists.recentlyAdded
});

const mapDispatchToProps = dispatch => ({
  getMemberInfo: () => dispatch(getMemberInfo())
});

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);