// react/reducers/index.js
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import member from './member';
import playlists from './playlists';

export default combineReducers({ member, playlists, routing });