// react/components/Admin/Admin.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { Button, Title, Container, ButtonGroup, Description } from '../Styles';

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
      : <Container>
        <Title>Admin Settings</Title>
        <ButtonGroup>
          <Description>Reload All Most Played Playlists</Description>
          <Button onClick={reloadMost} >Force Update Most Played</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Description>Reload All Recently Added Playlists</Description>
          <Button onClick={reloadRecent} >Force Update Recently Added</Button>
        </ButtonGroup>
      </Container>
  }
}