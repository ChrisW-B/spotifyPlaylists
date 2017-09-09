// react/reducers/index.js

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import member from './member';
import playlists from './playlists';
import loading from './loading';

export default combineReducers({ member, playlists, loading, routing });