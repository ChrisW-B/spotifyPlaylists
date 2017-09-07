// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import Back from 'react-icons/lib/io/arrow-left-c';
import { Wrapper, ProfilePhoto, WelcomeText, HeaderButton, LogOutButton, HeaderSpan, BackButton } from './Styles';

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    back: PropTypes.func.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string
  }
  static defaultProps = {
    photos: [],
    id: '',
    username: ''
  }

  render = () => {
    const { logout, openSettings, photos, id, back } = this.props;
    return (
      <Wrapper>
        <HeaderSpan>
          <Route path={'/:sub'} component={() => <BackButton onClick={back}><Back /></BackButton>} />
          { photos && photos.length ? <ProfilePhoto src={photos[0]} alt='profile_photo' /> : null}
        </HeaderSpan>
        <WelcomeText>Autolaylists for Spotify</WelcomeText>
        <HeaderSpan right>
          {
            id ? [
              <HeaderButton onClick={openSettings} key='settingsbtn'>Account Settings</HeaderButton>,
              <LogOutButton onClick={logout} key='logoutbtn'>Log Out</LogOutButton>
            ] : null
          }
        </HeaderSpan>
      </Wrapper>
    );
  }
}