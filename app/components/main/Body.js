import React, { Component } from "react";
import { Spin, Layout, Menu, Icon, Affix } from "antd";

import Base from "./Base";
import SideMenu from "./SideMenu";
import NoMatch from "../common/NoMatch";

import { renderRoutes, matchRoutes } from "react-router-config";
import { Link, Route } from "react-router-dom";

import routes from "../../routes";

import style from "./Body.scss";

export default class Body extends Base {
  state = {
    loading: true
  };
  render() {
    //匹配路由，没有则转到错误页面
    let matched = false;
    const matchedRoutes = matchRoutes(routes, location.pathname);
    if (matchedRoutes && matchedRoutes.length) {
      const { match, route } = matchedRoutes[0];
      if (route.component) {
        matched = true;
      }
    }

    return (
      <Layout className={style.body}>
        <Layout.Sider
          className={style.sidemenu}
          ref={ref => {
            if (ref) {
              this.affixContainer = ref;
            }
          }}
          trigger={null}
          collapsible
          collapsedWidth={100}
          collapsed={this.props.collapsed}
        >
          <Route component={SideMenu} />
        </Layout.Sider>
        <Layout>{!matched ? <NoMatch /> : renderRoutes(routes)}</Layout>
      </Layout>
    );
  }
}
