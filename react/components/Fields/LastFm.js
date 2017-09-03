// react/components/Fields/LastFm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class LastFm extends Component {
  static propTypes = {
    lastfm: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render = () => {
    const { lastfm, onChange } = this.props;
    return (
      <p>
        LastFM Username
        <input
          required
          type='text'
          value={lastfm}
          onChange={onChange}
        />
      </p>
    );
  }
}