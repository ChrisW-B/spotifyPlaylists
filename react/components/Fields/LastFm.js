// react/components/Fields/LastFm.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldWrapper, TextInput, FieldLabel } from './Styles';

export default class LastFm extends Component {
  static propTypes = {
    lastfm: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render = () => {
    const { lastfm, onChange } = this.props;
    return (
      <FieldWrapper>
        <FieldLabel>LastFM Username</FieldLabel>
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