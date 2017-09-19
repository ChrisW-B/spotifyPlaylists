// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Settings } from '../components';
import { logout, deleteAccount } from '../actions';

const mapStateToProps = ({ member }) => ({
  member
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  deleteAccount: () => dispatch(deleteAccount())
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);