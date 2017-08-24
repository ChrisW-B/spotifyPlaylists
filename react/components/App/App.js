// react/components/App/App.js

import React, { Component } from 'react';
import { MainPageContainer, LoggedInContainer } from '../../containers';
import { Route, Switch } from 'react-router';

export default class App extends Component {
  render = () =>
    <Switch>
      <Route path={'/loggedin'} exact component={LoggedInContainer} />
      <Route path={'/'} exact component={MainPageContainer} />
      {/*<Route path={'/settings'} exact component={SettingsContainer} />*/}
    </Switch>
}