// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LoginBackground, TextWrapper, WelcomeText, Description, SpotifyButton } from './Styles';

export default class MainPage extends Component {
  static propTypes = {
    login: PropTypes.func,
    status: PropTypes.string
  }
  render = () =>
    <LoginBackground state={this.props.status}>
      <TextWrapper title>
        <WelcomeText>Welcome to Autoplaylists for Spotify!</WelcomeText>
      </TextWrapper>
      <TextWrapper>
        <Description>Autoplaylists for Spotify will make and update <i>Most Played</i> and <i>Recently Added</i> playlists for you.</Description>
      </TextWrapper>
      <SpotifyButton onClick={this.props.login}>
        <img src='/images/spotify-login.png'/>
      </SpotifyButton>
    </LoginBackground>
}