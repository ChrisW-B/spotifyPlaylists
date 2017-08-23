// react/components/Playlists/Fields/LastFm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class LastFm extends Component {
  static propTypes = {
    lastfm: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render() {
    const { lastfm, onChange } = this.props;
    return (
      <p>
        LastFM Username
        <input
          required={true}
          type='text'
          value={lastfm}
          onChange={onChange}
        />
      </p>
    );
  }
}