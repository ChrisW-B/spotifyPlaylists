// react/components/Playlists/Playlists.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Playlist from './Playlist';

export default class Playlists extends Component {
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
      </div>
    );
  }
}