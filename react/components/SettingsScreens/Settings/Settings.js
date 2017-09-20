import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Title, Container, ButtonGroup, Description, Warning } from './Styles';

export default class Settings extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired
  }

  render() {
    const { logout, deleteAccount } = this.props;

    return (
      <Container>
        <Title settings>Your Account Settings</Title>
        <ButtonGroup>
          <Description>Logout</Description>
          <Button onClick={logout} >Logout</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Description>Delete Account</Description>
          <Button onClick={deleteAccount} >Delete Account</Button>
          <Warning>This will stop your playlists from updating, and will remove your playlist settings from our database.  <br /> You can always log in again with Spotify to start over</Warning>
        </ButtonGroup>
      </Container>
    );
  }
}