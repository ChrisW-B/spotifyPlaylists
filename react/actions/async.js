// react/actions/async.js

import { loading } from './';

export const get = (url, type, cb) =>
  async dispatch => {
    try {
      dispatch(loading(type));
      const response = await fetch(url, { credentials: 'same-origin' });
      if (response.status !== 200) throw new Error(`${response.status} Error`);
      return dispatch(cb(type, await response.json()))
    } catch (error) {
      return dispatch({ type: `${type}_FAIL`, error });
    }
  };

export const post = (url, type, item, cb) =>
  async dispatch => {
    dispatch(loading(type, item));
    try {
      const response = await fetch(url, {
        'method': 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        'body': JSON.stringify(item)
      });
      if (response.status !== 200) throw new Error(`${response.status} Error`);
      return dispatch(cb(type, await response.json()))
    } catch (error) {
      return dispatch({ type: `${type}_FAIL`, error });
    }
  };

export const del = (url, type, cb) =>
  async dispatch => {
    dispatch(loading(type));
    try {
      const response = await fetch(url, { method: 'DELETE', credentials: 'same-origin' });
      if (response.status !== 200) throw new Error(`${response.status} Error`);
      return dispatch(cb(type));
    } catch (error) {
      return dispatch({ type: `${type}_FAIL`, error });
    }
  };