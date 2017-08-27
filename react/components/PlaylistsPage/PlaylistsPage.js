import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HeaderContainer, PlaylistsContainer } from '../../containers';
import { PlaylistsPageWrapper } from './Styles';
export default class PlaylistsPage extends Component {
  static propTypes = {
    status: PropTypes.string
  }
  render = () =>
    <PlaylistsPageWrapper status={this.props.status}>
      <HeaderContainer/>
      <PlaylistsContainer />
    </PlaylistsPageWrapper>

}