import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Radio, RadioLabel } from './Styles';

export default class Options extends Component {
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
  ];
  render = () => {
    const { period, onChange } = this.props;
    return this.options.map(({ value, title }) => (
      <RadioLabel key={value} checked={period === value}>
        <Radio
          type='radio'
          name='period'
          value={value}
          checked={period === value}
          onChange={onChange}
        />{title}
      </RadioLabel>
    ))
  }
}