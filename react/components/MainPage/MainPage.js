// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HeaderContainer, PlaylistsContainer } from '../../containers';
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
      <HeaderContainer />
      {
        this.props.member.id
        ? <div><p>congrat</p> <PlaylistsContainer/> </div>
        : <button onClick={this.login}>log in</button>
      }
    </div>
}