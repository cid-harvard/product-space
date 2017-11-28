import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from './Root';
const {
  appContainerId,
} = require('../build/buildConstants');

ReactDOM.render(
  <Root/>,
  document.getElementById(appContainerId),
);
