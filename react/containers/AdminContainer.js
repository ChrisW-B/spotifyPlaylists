// react/containers/AdminContainer.js

import { connect } from 'react-redux';
import { Admin } from '../components';
import { reloadRecent, reloadMost } from '../actions';

const mapStateToProps = ({ member }) => ({
  isAdmin: member.isAdmin
});

const mapDispatchToProps = dispatch => ({
  reloadRecent: () => dispatch(reloadRecent()),
  reloadMost: () => dispatch(reloadMost())
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);