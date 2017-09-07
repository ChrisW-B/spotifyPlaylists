import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

export default class Settings extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired,
    id: PropTypes.string
  }
  static defaultProps = {
    id: null
  }

  render() {
    const { logout, id, deleteAccount } = this.props;
    return (!id)
      ? <Redirect to='/' />
      : <div>
        hi friend
        <button onClick={logout} >logout</button>
        <button onClick={deleteAccount} >delete account </button>
      </div>
  }
}