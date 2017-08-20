// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';
import { logout } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  member: state.member
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);