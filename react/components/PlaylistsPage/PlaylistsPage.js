import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import { HeaderContainer, PlaylistListContainer, SettingsContainer } from '../../containers';
import PlaylistsPageWrapper from './Styles';

export default class PlaylistsPage extends Component {
  static propTypes = {
    status: PropTypes.string.isRequired
  }
  render = () =>
    (<PlaylistsPageWrapper status={this.props.status}>
      <HeaderContainer />
      <Route path={'/'} exact component={PlaylistListContainer} />
      <Route path={'/settings'} exact component={SettingsContainer} />
    </PlaylistsPageWrapper>)
}