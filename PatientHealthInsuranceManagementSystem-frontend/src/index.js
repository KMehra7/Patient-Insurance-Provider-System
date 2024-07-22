import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './containers/App';
import * as serviceWorker from './serviceWorker';

const DO_NOT_LOGIN = false;

// runWithAdal(authContext, () => {
  ReactDOM.render(
      <App />,
      document.getElementById('root')
  );
  serviceWorker.unregister();
// }, DO_NOT_LOGIN);
