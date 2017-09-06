// react/components/App/App.js

import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { MainPageContainer } from '../../containers';
import { FinishVerify } from '../';

export default class App extends Component {
  render = () =>
    (<Switch>
      <Route path={'/loggedin'} exact component={FinishVerify} />
      <Route path={'/'} exact component={MainPageContainer} />
    </Switch>)
}