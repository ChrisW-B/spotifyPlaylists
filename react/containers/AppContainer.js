// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';
import { logout, deleteAccount } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  name: state.member.username
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  deleteAccount: () => dispatch(deleteAccount())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);