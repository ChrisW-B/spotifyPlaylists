// react/components/Fields/Length/Length.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldWrapper, NumberInput, LengthContainer, SliderInput, FieldLabel, SongLabel } from './Styles';

export default class Length extends Component {
  static propTypes = {
    length: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render = () => {
    const { length, onChange } = this.props;
    return (
      <FieldWrapper>
        <FieldLabel>Playlist Length</FieldLabel>
        <LengthContainer>
          <SliderInput
            required
            type='range'
            min='1'
            max='50'
            step='1'
            value={length}
            onChange={onChange}
          />
          <span>
            <NumberInput
              required
              type='number'
              min='1'
              max='50'
              value={length}
              onChange={onChange}
            />
            <SongLabel>Song{length > 1 ? 's' : ''}</SongLabel>
          </span>
        </LengthContainer>
      </FieldWrapper>
    );
  }
}