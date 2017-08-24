// react/components/LoggedIn/LoggedIn.js

import React, { Component } from 'react';

export default class LoggedIn extends Component {
  componentDidMount() {
    localStorage.setItem('loggedInSuccess', true);
    window.close();
  }

  render = () => <p>Sucess! Sending you back to the app...</p>
}