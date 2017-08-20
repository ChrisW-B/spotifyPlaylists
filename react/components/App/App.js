import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired,
    name: PropTypes.string
  }
  render() {
    const { logout, deleteAccount, name = '' } = this.props;
    return (
      <div>
        {name? <h1>Hi {name}!</h1> : ''}
        <a href='/member/login'>Login</a>
        <button onClick={logout}>Log Out</button>
        <button onClick={deleteAccount}>Delete Account</button>
      </div>
    );
  }
}