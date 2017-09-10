import React, { Component } from 'react';
import { Wrapper, Text, Link } from './Styles';

export default class Footer extends Component {
  render() {
    return (
      <Wrapper>
        <Text>Made in 2017 By Chris Barry | <Link href='//github.com/chrisw-b/spotifyPlaylists'>Source</Link></Text>
      </Wrapper>
    );
  }
}