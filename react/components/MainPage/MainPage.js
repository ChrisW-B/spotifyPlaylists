// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Transition from 'react-transition-group/Transition';
import { LoginScreen, Content } from '../';

export default class MainPage extends Component {
  static propTypes = {
    spotifyId: PropTypes.string,
    getMemberInfo: PropTypes.func.isRequired
  }

  static defaultProps = {
    spotifyId: ''
  }

  reloadMember = () => {
    localStorage.clear();
    this.props.getMemberInfo();
  }

  login = () => {
    window.open('/member/login', '_blank', 'height=600,width=400');
    window.addEventListener('storage',
      e => e.key === 'loggedInSuccess'
      ? this.reloadMember()
      : null
    );
  }

  render = () =>
    (<div>
      <Transition timeout={300} in={!!this.props.spotifyId} unmountOnExit mountOnEnter>
        {status => <Content status={status} /> }
      </Transition>
      <Transition timeout={300} in={!this.props.spotifyId} unmountOnExit mountOnEnter>
        { status => <LoginScreen login={this.login} status={status} /> }
      </Transition>
    </div>)
}