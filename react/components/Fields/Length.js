// react/components/Playlists/Fields/Length.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Length extends Component {
  static propTypes = {
    length: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render() {
    const { length, onChange } = this.props;
    return (
      <p>
        Playlist Length
        <input
          required={true}
          type='range'
          min='1'
          max='50'
          step='1'
          value={length}
          onChange={onChange}
        />
        {length} Song{length !== 1 ? 's':''}
      </p>
    );
  }
}