// react/components/MainPage/MainPage.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PlaylistsContainer } from '../../containers';
export default class MainPage extends Component {
  static propTypes = {
    member: PropTypes.object
  }

  render = () =>
    this.props.member.id
    ? <div><p>congrat</p> <PlaylistsContainer/> </div>
    : <p>login pls <a href='/member/login'>Login</a></p>;

}