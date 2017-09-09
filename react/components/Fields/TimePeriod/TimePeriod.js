// react/components/Fields/TimePeriod/TimePeriod.js

import React, { Component } from 'react';
import Options from './Options';
import { FieldLabel, FieldWrapper } from './Styles';

export default class TimePeriod extends Component {

  render = () => (
    <FieldWrapper>
      <FieldLabel>Time Period</FieldLabel>
      <span>
        <Options {...this.props} />
      </span>
    </FieldWrapper>
  );
}