// react/components/PlaylistsPage/PlaylistsPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Playlist } from '..';
import { ListWrapper, List } from './Styles';

export default class PlaylistsPage extends Component {
  static propTypes = {
    updatePlaylistStatus: PropTypes.func.isRequired,
    updateMostPlayed: PropTypes.func.isRequired,
    updateRecentlyAdded: PropTypes.func.isRequired,
    toggleMostPlayed: PropTypes.func.isRequired,
    toggleRecentlyAdded: PropTypes.func.isRequired,
    mostPlayed: PropTypes.shape({
      enabled: PropTypes.bool,
      length: PropTypes.number,
      lastfm: PropTypes.string,
      period: PropTypes.string
    }).isRequired,
    recentlyAdded: PropTypes.shape({
      enabled: PropTypes.bool,
      length: PropTypes.number
    }).isRequired,
  }

  componentDidMount = () => this.props.updatePlaylistStatus();

  render = () => {
    const { mostPlayed, recentlyAdded, toggleMostPlayed, toggleRecentlyAdded, updateMostPlayed, updateRecentlyAdded } = this.props;
    return (
      <ListWrapper>
        <h1> Your Playlists </h1>
        <List>
          <Playlist
            title='Most Played'
            description='A playlist full of your most played songs from Last.fm'
            toggle={() => toggleMostPlayed(!mostPlayed.enabled)}
            saveSettings={updateMostPlayed}
            {...mostPlayed}
          />
          <Playlist
            title='Recently Added'
            description='All the songs you just added to spotify'
            toggle={() => toggleRecentlyAdded(!recentlyAdded.enabled)}
            saveSettings={updateRecentlyAdded}
            {...recentlyAdded}
          />
        </List>
        <h5>Playlists will update roughly every 5 hours</h5>
      </ListWrapper>
    );
  }
}