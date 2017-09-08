// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Back from 'react-icons/lib/io/arrow-left-c';
import {  Transition } from 'react-transition-group';
import { Wrapper, ProfilePhoto, WelcomeText, HeaderButton, LogOutButton, HeaderSpan, BackButton } from './Styles';

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    back: PropTypes.func.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    pathname: PropTypes.string
  }
  static defaultProps = {
    photos: [],
    id: '',
    username: '',
    pathname: '/'
  }

  render = () => {
    const { logout, openSettings, photos, id, back, pathname } = this.props;
    return (
      <Wrapper>
        <HeaderSpan>
          <Transition timeout={300} in={!(pathname === '/' || pathname === '')} unmountOnExit mountOnEnter appear>
            { status => <BackButton status={status} onClick={back}><Back /></BackButton>}
          </Transition>
          <Transition timeout={300} in={!!(photos && photos.length)} unmountOnExit mountOnEnter>
            { status => <ProfilePhoto status={status} src={photos[0]} alt='profile_photo' />}
          </Transition>
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