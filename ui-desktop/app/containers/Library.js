import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Library from '../components/Library';
import * as CounterActions from '../actions/counter'; //TODO

function mapStateToProps(state) {
  return {
    counter: state.counter
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Library);
