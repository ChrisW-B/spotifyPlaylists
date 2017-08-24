// react/containers/LoggedInContainer.js

import { connect } from 'react-redux';
import { LoggedIn } from '../components';
import { getMemberInfo } from '../actions';

const mapDispatchToProps = dispatch => ({
  getMemberInfo: () => dispatch(getMemberInfo())
});

export default connect(null, mapDispatchToProps)(LoggedIn);