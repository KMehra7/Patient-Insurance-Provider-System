import React, {Component, Fragment} from 'react';
import {Switch, Route, withRouter, Redirect} from 'react-router-dom';
import { ToastProvider } from '../utils/react-toast-notifications';
import {connect} from 'react-redux';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import {configureStore} from '../store';
import empty from 'is-empty';
import jwt_decode from 'jwt-decode';

import {state_set_dark} from '../store/actions/dark';
import {setCurrentUser, logoutUser} from '../store/actions/user';

import setAuthToken from '../utils/setAuthToken';

import Main from './Main';
import Toast from '../components/Graphics/Toast';

import '../css/overall.css';

const store = configureStore();

if(!empty(localStorage.dark)) {
  store.dispatch(state_set_dark(localStorage.dark === "true"));
}

if(localStorage.jwtToken) {

  try {
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    store.dispatch(setCurrentUser(decoded));

    // Check for expired token
    const currentTime = Date.now() / 1000; // to get in milliseconds
    if (decoded.exp < currentTime) {
      // Logout user
      store.dispatch(logoutUser());
      // Redirect to login
      window.location.href = "/";
    }
  } catch(e) {
    console.log('invalid token');
  }
  
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <Fragment>
        <ToastProvider placement="bottom-center" components={{ Toast: Toast }}>
          <Provider store={store}>
            <Router>
              <Main />
            </Router>
          </Provider>
        </ToastProvider>
      </Fragment>
    );
  }
}

export default App;
