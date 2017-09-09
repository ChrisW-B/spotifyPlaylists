import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { HeaderContainer, PlaylistsPageContainer, SettingsContainer, AdminContainer } from '../../containers';
import ContentWrapper from './Styles';

export default class Content extends Component {
  static propTypes = {
    status: PropTypes.string.isRequired
  }
  render = () =>
    (<ContentWrapper status={this.props.status}>
      <HeaderContainer />
      <Switch>
        <Route path={'/settings'} component={SettingsContainer} />
        <Route path={'/admin'} component={AdminContainer} />
        <Route path={'/'} component={PlaylistsPageContainer} />
      </Switch>
    </ContentWrapper>)
}