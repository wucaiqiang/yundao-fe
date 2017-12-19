import FS from "fs";
import express from "express";
import nconf from "nconf";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  withRouter,
  Router,
  Route,
  matchPath,
  StaticRouter
} from "react-router";

import { renderRoutes, matchRoutes } from "react-router-config";

import baseManager from "./base-manager";
import routes from "../routes-server";

import ContextWrapper from "../components/common/ContextWrapper";

const routeManager = Object.assign({}, baseManager, {
  configureDevelopmentEnv(app) {
    const apiRouter = this.createApiRouter();
    const pagesRouter = this.createPageRouter();
    app.use("/api", apiRouter);
    app.use("/", pagesRouter);
  },

  createPageRouter() {
    const router = express.Router();

    router.get("*", (req, res) => {
      // inside a request
      const branch = matchRoutes(routes, req.url);
      if (branch && branch.length) {
        const [
          { route: { title = "", keywords = "", description = "" } }
        ] = branch;
        const { promises, components } = this.mapComponentsToPromises(branch);
        Promise.all(promises)
          .then(values => {
            const data = this.prepareData(values, components);
            const html = this.render(req, data);
            const context = {
              splitPoints: []
            };
            res.render("index", {
              title: title,
              keywords: keywords,
              description: description,
              content: html,
              data: JSON.stringify(data),
              splitPoints: JSON.stringify(context.splitPoints)
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).send(err);
          });
      }
    });

    return router;
  },

  mapComponentsToPromises(branch) {
    let promises = [];
    const filteredComponents = branch.filter(({ route, match }) => {
      const requestData = route.component.requestData;
      if (typeof requestData === "function") {
        promises.push(requestData(match.params, nconf.get("domain")));
      }
      return typeof requestData === "function";
    });

    return { promises, components: filteredComponents };
  },

  prepareData(values, components) {
    const map = {};

    values.forEach((value, index) => {
      map[components[index].route.component.NAME] = value.data;
    });

    return map;
  },

  render(req, data) {
    let html = renderToString(
      <ContextWrapper data={data}>
        <StaticRouter location={req.url} context={{ data }}>
          {renderRoutes(routes)}
        </StaticRouter>
      </ContextWrapper>
    );

    return html;
  },

  createApiRouter(app) {
    const router = express.Router();
    return router;
  }
});

export default routeManager;
