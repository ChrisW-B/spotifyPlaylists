// react/components/Admin/Admin.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

export default class Admin extends Component {
  static propTypes = {
    reloadRecent: PropTypes.func.isRequired,
    reloadMost: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired
  }
  render() {
    const { reloadRecent, isAdmin, reloadMost } = this.props;
    return (!isAdmin)
      ? <Redirect to='/' />
      : <div>
        hi friend
        <button onClick={reloadRecent} >update most played</button>
        <button onClick={reloadMost} >update recently added</button>
      </div>
  }
}