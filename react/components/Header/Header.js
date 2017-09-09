// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Back from 'react-icons/lib/io/arrow-left-c';
import { Transition } from 'react-transition-group';
import { Wrapper, ProfilePhoto, WelcomeText, HeaderButton, LogOutButton, HeaderSpan, BackButton, AdminButton } from './Styles';

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    openAdmin: PropTypes.func.isRequired,
    goHome: PropTypes.func.isRequired,
    back: PropTypes.func.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    pathname: PropTypes.string,
    isAdmin: PropTypes.bool
  }
  static defaultProps = {
    photos: [],
    id: '',
    username: '',
    pathname: '/',
    isAdmin: false
  }

  state = {
    clicked: false
  }

  photoClicked = () => {
    this.setState({ clicked: true }, () => setTimeout(() => this.setState({ clicked: false }), 2000));
    if (!(this.props.pathname === '/' || this.props.pathname === '')) this.props.goHome();
  }

  render = () => {
    const { logout, openSettings, photos, id, back, isAdmin, openAdmin } = this.props;
    return (
      <Wrapper>
        <HeaderSpan>
          <Transition timeout={300} in={!(this.props.pathname === '/' || this.props.pathname === '')} unmountOnExit mountOnEnter appear>
            { status => <BackButton status={status} onClick={back}><Back /></BackButton>}
          </Transition>
          <Transition timeout={300} in={!!(photos && photos.length)} unmountOnExit mountOnEnter>
            { status => <ProfilePhoto onClick={this.photoClicked} status={status} src={photos[0]} alt='profile_photo' clicked={this.state.clicked} />}
          </Transition>
        </HeaderSpan>
        <WelcomeText>Autolaylists for Spotify</WelcomeText>
        <HeaderSpan right>
          {
            id ? [
              isAdmin ? <AdminButton onClick={openAdmin} key='adminbtn'>Admin</AdminButton> : null,
              <HeaderButton onClick={openSettings} key='settingsbtn'>Account Settings</HeaderButton>,
              <LogOutButton onClick={logout} key='logoutbtn'>Log Out</LogOutButton>,
            ] : null
          }
        </HeaderSpan>
      </Wrapper>
    );
  }
}