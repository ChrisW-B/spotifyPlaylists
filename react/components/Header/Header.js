// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper, ProfilePhoto, WelcomeText, HeaderButton, LogOutButton, HeaderSpan } from './Styles';

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    member: PropTypes.shape({
      country: PropTypes.string,
      displayName: PropTypes.string,
      followers: PropTypes.number,
      id: PropTypes.string,
      isAdmin: PropTypes.bool,
      photos: PropTypes.arrayOf(PropTypes.string),
      product: PropTypes.string,
      profileUrl: PropTypes.string,
      provider: PropTypes.string,
      username: PropTypes.string
    }).isRequired
  }
  render = () => {
    const { logout, openSettings, member: { photos, id, username } } = this.props;
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