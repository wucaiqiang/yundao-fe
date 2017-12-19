import React from "react";
import { Router } from "react-router-dom";
import { render } from "react-dom";

import createHistory from "history/createBrowserHistory";
import ContextWrapper from "./components/common/ContextWrapper";
const history = createHistory();

import App from "./components/main/App";

import {Alert} from 'antd'

import * as Bundles from "./Bundles";

const mountNode = document.getElementById("app");
const splitPoints = window.splitPoints || [];
Promise.all(
  splitPoints.map(chunk => Bundles[chunk].loadComponent())
).then(() => {
  render(
    <ContextWrapper data={window.APP_STATE || {}}>
      <Router history={history} context={window.APP_STATE || {}}>

        <App history={history} />
      </Router>
    </ContextWrapper>,
    mountNode
  );
});
