// react/components/Header/Header.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div `
background: var(--oc-indigo-7);
width: 100%;
`;

export default class Header extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired,
    memberId: PropTypes.string
  }
  render = () =>
    <Wrapper>
      Header!
      {this.props.memberId ? <button onClick={this.props.logout}>log out</button> : null}
    </Wrapper>
}