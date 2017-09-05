// react/components/Fields/Length.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldWrapper, NumberInput, SliderInput } from './Styles';

export default class Length extends Component {
  static propTypes = {
    length: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }
  render = () => {
    const { length, onChange } = this.props;
    return (
      <FieldWrapper>
        <span>Playlist Length</span>
        <span>
          <SliderInput
            required
            type='range'
            min='1'
            max='50'
            step='1'
            value={length}
            onChange={onChange}
          />
          <NumberInput
            required
            type='number'
            min='1'
            max='50'
            value={length}
            onChange={onChange}
          /> Song{length !== 1 ? 's' : ''}
        </span>
      </FieldWrapper>
    );
  }
}