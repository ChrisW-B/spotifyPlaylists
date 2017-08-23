// react/components/Playlists/Fields/TimePeriod.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
            <label key={o.value}>
              <input
                type='radio'
                name='period'
                value={o.value}
                checked={period===o.value}
                onChange={onChange}
              />{o.title}
            </label>
          ))
        }
      </div>
    );
  }
}