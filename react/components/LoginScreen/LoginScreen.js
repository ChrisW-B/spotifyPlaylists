// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TitleWrapper, LoginBackground, TextWrapper, WelcomeText, Description, SpotifyButton, PlaylistTitle } from './Styles';

export default class MainPage extends Component {
  static propTypes = {
    login: PropTypes.func,
    status: PropTypes.string
  }
  render = () =>
    <LoginBackground status={this.props.status}>
      <TitleWrapper>
        <WelcomeText>Welcome to Autoplaylists for Spotify!</WelcomeText>
      </TitleWrapper>
      <TextWrapper>
        <Description>Autoplaylists for Spotify will make and update <PlaylistTitle>Most Played</PlaylistTitle> and <PlaylistTitle>Recently Added</PlaylistTitle> playlists for you.</Description>
      </TextWrapper>
      <SpotifyButton onClick={this.props.login}>
        <img src='/images/spotify-login.png'/>
      </SpotifyButton>
    </LoginBackground>
}