// react/components/PlaylistList/PlaylistList.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Playlist } from '..';

export default class PlaylistList extends Component {
  static propTypes = {
    updatePlaylistStatus: PropTypes.func.isRequired,
    updateMostPlayed: PropTypes.func.isRequired,
    updateRecentlyAdded: PropTypes.func.isRequired,
    toggleMostPlayed: PropTypes.func.isRequired,
    toggleRecentlyAdded: PropTypes.func.isRequired,
    mostPlayed: PropTypes.object.isRequired,
    recentlyAdded: PropTypes.object.isRequired
  }

  componentDidMount = () => this.props.updatePlaylistStatus();

  render = () => {
    const { mostPlayed, recentlyAdded, toggleMostPlayed, toggleRecentlyAdded, updateMostPlayed, updateRecentlyAdded } = this.props;
    return (
      <div>
        <Playlist
          title='Most Played'
          description='A play'
          toggle={()=>toggleMostPlayed(!mostPlayed.enabled)}
          saveSettings={updateMostPlayed}
          {...mostPlayed}
           />
        <Playlist
          title='Recently Added'
          toggle={()=>toggleRecentlyAdded(!recentlyAdded.enabled)}
          saveSettings={updateRecentlyAdded}
          {...recentlyAdded}
        />
        <h5>Playlists will update roughly every 5 hours</h5>
      </div>
    );
  }
}