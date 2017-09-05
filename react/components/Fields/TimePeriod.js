// react/components/Fields/TimePeriod.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FieldWrapper, Radio, RadioLabel, FieldLabel } from './Styles';

export default class TimePeriod extends Component {
  static propTypes = {
    period: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  options = [
    { value: 'overall', title: 'All Time' },
    { value: '12month', title: '1 Year' },
    { value: '6month', title: '6 Months' },
    { value: '3month', title: '3 Months' },
    { value: '1month', title: '1 Month' },
    { value: '7day', title: '1 Week' }
  ]
  render = () => {
    const { period, onChange } = this.props;
    return (
      <FieldWrapper>
        <FieldLabel>Time Period</FieldLabel>
        <span>
          {
            this.options.map(o => (
              <RadioLabel key={o.value} checked={period === o.value}>
                <Radio
                  type='radio'
                  name='period'
                  value={o.value}
                  checked={period === o.value}
                  onChange={onChange}
                />{o.title}
              </RadioLabel>
            ))
          }
        </span>
      </FieldWrapper>
    );
  }
}