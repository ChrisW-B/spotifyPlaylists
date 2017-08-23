// react/components/Playlists/Playlists.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Playlist from './Playlist';

export default class Playlists extends Component {
  static propTypes = {
    updatePlaylistStatus: PropTypes.func.isRequired,
    updateMostPlayedSettings: PropTypes.func.isRequired,
    updateRecentlyAddedSettings: PropTypes.func.isRequired,
    toggleMostPlayed: PropTypes.func.isRequired,
    toggleRecentlyAdded: PropTypes.func.isRequired,
    mostPlayed: PropTypes.object.isRequired,
    recentlyAdded: PropTypes.object.isRequired
  }

  componentDidMount = () => this.props.updatePlaylistStatus();

  render = () => {
    const { mostPlayed, recentlyAdded, toggleMostPlayed, toggleRecentlyAdded, updateMostPlayedSettings, updateRecentlyAddedSettings } = this.props;
    return (
      <div>
        <Playlist
          title='Most Played'
          toggle={()=>toggleMostPlayed(!mostPlayed.enabled)}
          saveSettings={updateMostPlayedSettings}
          {...mostPlayed}
           />
        <Playlist
          title='Recently Added'
          toggle={()=>toggleRecentlyAdded(!recentlyAdded.enabled)}
          saveSettings={updateRecentlyAddedSettings}
          {...recentlyAdded}
        />
      </div>
    );
  }
}