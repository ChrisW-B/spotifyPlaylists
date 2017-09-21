// react/actions/async.js

import { loading } from './';

export const graphQL = (type, cb, query, variables = {}) =>
  async dispatch => {
    try {
      dispatch(loading(type));
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ query, variables })
      });
      if (response.status !== 200) throw new Error(`${response.status} Error`);
      const json = await response.json();
      return dispatch(cb(type, json.data));
    } catch (error) {
      return dispatch({ type: `${type}_FAIL`, error })
    }
  }

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