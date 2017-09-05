// react/components/Fields/LastFm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldWrapper, TextInput } from './Styles';

export default class LastFm extends Component {
  static propTypes = {
    lastfm: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render = () => {
    const { lastfm, onChange } = this.props;
    return (
      <FieldWrapper>
        <span>LastFM Username</span>
        <span>
          <TextInput
            required
            type='text'
            value={lastfm}
            onChange={onChange}
            placeholder='Your Last.FM ID'
          />
        </span>
      </FieldWrapper>
    );
  }
}