import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Playlists extends Component {
  static propTypes = {
    updatePlaylistStatus: PropTypes.func.isRequired,
    toggleMostPlayed: PropTypes.func.isRequired,
    toggleRecentlyAdded: PropTypes.func.isRequired,
    mostPlayed: PropTypes.object.isRequired,
    recentlyAdded: PropTypes.object.isRequired
  }

  componentDidMount = () => this.props.updatePlaylistStatus();

  render = () => {
    const { mostPlayed, recentlyAdded, toggleMostPlayed, toggleRecentlyAdded } = this.props;
    return (
      <div>
        <p>
          Most Played: {!mostPlayed.enabled ? 'Off': 'On'}
          <button onClick={() => toggleMostPlayed(!mostPlayed.enabled)}>
            Turn {mostPlayed.enabled ? 'Off': 'On'}
          </button>
        </p>
        <p>
          Recently Added: {!recentlyAdded.enabled ? 'Off': 'On'}
          <button onClick={() => toggleRecentlyAdded(!recentlyAdded.enabled)}>
            Turn {recentlyAdded.enabled ? 'Off': 'On'}
          </button>
        </p>
      </div>
    );
  }
}