import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Settings extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired
  }
  static defaultProps = {
    id: null
  }

  render() {
    const { logout, deleteAccount } = this.props;

    return (
      <div>
        hi friend
        <button onClick={logout} >logout</button>
        <button onClick={deleteAccount} >delete account </button>
      </div>
    );
  }
}