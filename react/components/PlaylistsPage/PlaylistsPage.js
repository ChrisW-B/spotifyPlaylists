import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HeaderContainer, PlaylistListContainer } from '../../containers';
import PlaylistsPageWrapper from './Styles';

export default class PlaylistsPage extends Component {
  static propTypes = {
    status: PropTypes.string.isRequired
  }
  render = () =>
    (<PlaylistsPageWrapper status={this.props.status}>
      <HeaderContainer />
      <PlaylistListContainer />
    </PlaylistsPageWrapper>)
}