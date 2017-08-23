// react/components/App/App.js

import React, { Component } from 'react';
import { HeaderContainer, MainPageContainer } from '../../containers';
import { Route, Switch } from 'react-router';

export default class App extends Component {
  render = () =>
    <div>
      <HeaderContainer />
      <Switch>
        <Route path={'/'} exact component={MainPageContainer} />
        {/*<Route path={'/settings'} exact component={SettingsContainer} />*/}
      </Switch>
    </div>
}