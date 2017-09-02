// react/components/Fields/TimePeriod.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const RadioLabel = styled.label`
  background: ${props => props.checked ? 'var(--oc-violet-9)' : 'white'};
  border: 1px solid var(--oc-violet-9);
  border-left: 0;
  color: ${props => props.checked ? 'white' : 'var(--oc-violet-9)'};
  cursor: pointer;
  padding: 5px;
  &:first-child {
    border: 1px solid var(--oc-violet-9);
    border-radius: 5px 0 0 5px;
  }
  &:last-child {
    border-radius: 0 5px 5px 0;
  }
`;

const Radio = styled.input`
  display: none;
`;

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
      <div>
        Time Period
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
      </div>
    );
  }
}