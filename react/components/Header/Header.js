// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper, ProfilePhoto, WelcomeText, HeaderButton, LogOutButton, HeaderSpan } from './Styles';

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    username: PropTypes.string
  }
  static defaultProps = {
    photos: [],
    id: '',
    username: ''
  }

  render = () => {
    const { logout, openSettings, photos, id, username } = this.props;
    return (
      <Wrapper>
        <HeaderSpan>
          { photos && photos.length ? <ProfilePhoto src={photos[0]} alt='profile_photo' /> : null}
        </HeaderSpan>
        <WelcomeText>Welcome to Autolaylists for Spotify {username}!</WelcomeText>
        <HeaderSpan right>
          {
            id ? [
              <HeaderButton onClick={openSettings} key='settingsbtn'>Profile Settings</HeaderButton>,
              <LogOutButton onClick={logout} key='logoutbtn'>Log Out</LogOutButton>
            ] : null
          }
        </HeaderSpan>
      </Wrapper>
    );
  }
}