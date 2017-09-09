// react/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import thunkMiddleware from 'redux-thunk';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { injectGlobal } from 'emotion';

import Reducers from './reducers';
import { getMemberInfo } from './actions';
import { AppContainer } from './containers';

if (module.hot && ENV !== 'production') {
  module.hot.accept();
}
const history = createHistory();
let middleware = [thunkMiddleware, routerMiddleware(history)];

if (ENV !== 'production') {
  const { createLogger } = require('redux-logger');
  const loggerMiddleware = createLogger({
    timestamp: false,
    level: {
      // redux dev tools can do all of this without cluttering the console
      // download! http://extension.remotedev.io/
      prevState: false,
      action: 'error',
      nextState: false,
      error: 'error'
    },
    predicate: (_, action) => action.error // only logs messages with errors
  });
  middleware = [...middleware, loggerMiddleware];
}

// keep in prod, it only loads if you have redux devtools and there shouldn't be anything sensitive
// if there is, this is bad code
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(Reducers, composeEnhancers(applyMiddleware(...middleware)));
store.dispatch(getMemberInfo());

injectGlobal `
  body,
  html,
  #root {
    font-family: Lato, sans-serif;
    margin: 0;
    overflow-x: hidden;
  }
`;

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <AppContainer />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);