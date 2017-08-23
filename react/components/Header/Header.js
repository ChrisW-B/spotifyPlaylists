// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired
  }
  render = () =>
    <div>
      Header!
      <button onClick={this.props.logout}>log out</button>
    </div>
}