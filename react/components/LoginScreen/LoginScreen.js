// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style, { keyframes } from 'styled-components';

export default class MainPage extends Component {
  static propTypes = {
    login: PropTypes.func
  }

  render = () =>
    <LoginBackground>
      <TextWrapper primary>
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

const AnimateBG = keyframes `
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 500em 0;
  }
`;

const LoginBackground = style.div `
  align-items: left;
  animation: 60s ${AnimateBG} linear infinite;
  background: repeating-linear-gradient(130deg, #FA8BFF 0%, #2BFF88 35%, #2BD2FF 65%, #FA8BFF 90%);
  background-color: #00dbde;
  background-size: 500em 100vh;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

const SpotifyButton = style.button `
  background: transparent;
  border: none;
  cursor: pointer;
  justify-self: center;
`;

const TextWrapper = style.h1 `
  line-height: 1.7;
  max-width: ${props=> props.primary ? '600px': '420px'};
  & > * {
    background-color: white;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    box-shadow: 0 0 7px -3px #444;
    color: black;
    display: inline;
    padding: 5px;
  }
`;

const WelcomeText = style.span `
  font-size: 45px;
  font-weight: 700;
  padding-left: 20px;
  padding-right: 10px;
`;

const Description = style.span `
  font-size: 18px;
  font-weight: 400;
  padding: 10px;
  padding-left: 20px;
  & i {
    color: #666;
    font-style: normal;
  }
`;