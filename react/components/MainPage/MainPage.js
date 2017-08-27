// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Transition from 'react-transition-group/Transition';
import { LoginScreen, PlaylistsPage } from '../';

export default class MainPage extends Component {
  static propTypes = {
    member: PropTypes.object,
    getMemberInfo: PropTypes.func.isRequired
  }

  reloadMember = () => {
    localStorage.clear();
    this.props.getMemberInfo();
  }

  login = () => {
    window.open('/member/login', '_blank', 'height=600,width=400');
    window.addEventListener('storage',
      (e) => e.key === 'loggedInSuccess'
      ? this.reloadMember()
      : null
    );
  }

  render = () =>
    <div>
      <Transition timeout={300} in={!!this.props.member.id} unmountOnExit mountOnEnter>
        {status => <PlaylistsPage status={status}/> }
      </Transition>
      <Transition timeout={300} in={!this.props.member.id} unmountOnExit mountOnEnter>
        { status => <LoginScreen login={this.login} status={status} /> }
      </Transition>
    </div>

}