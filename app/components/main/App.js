import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Layout, Alert } from "antd";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import { renderRoutes, matchRoutes } from "react-router-config";

import Base from "./Base";
import Header from "./Header";
import Body from "./Body";
import Login from "../../entry/Login";
import NoMatch from "../common/NoMatch";

import utils from "../../utils/";

import routes from "../../routes";

import style from "./App.scss";

import Auth from "model/Auth/";

const findFirstLeaf = menu => {
  if (menu.childs && menu.childs.length) {
    return findFirstLeaf(menu.childs[0]);
  } else {
    return menu;
  }
};

class APP extends Base {
  constructor(props, context) {
    super(props, context);
    this.state = {
      collapsed: false
    };
    window.APP = this;
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  componentDidMount() {
    // ReactDOM.unstable_renderSubtreeIntoContainer(
    //   this,
    //   ,document.body
    // );
  }

  render() {
    let isLogin =
      utils.getCookie("ticket") && utils.getStorage("userInfo") ? true : false;
    let redireaciton = null;
    const { history } = this.props;
    if (location.pathname === "/login") {
      isLogin = false;
      const params = utils.parseQuery(location.search);
      if (params.return) {
        redireaciton = encodeURIComponent(params.return);
      }
    } else {
      redireaciton = encodeURIComponent(location.pathname);
    }

    const indexRoute = routes[0];
    const rootPath = "/";

    const { onceEditPwd } = utils.getStorage("userInfo") || {};

    //匹配路由，没有则转到错误页面,

    let matched = false,
      needLogin = true;
    const matchedRoutes = matchRoutes(routes, location.pathname);
    if (matchedRoutes && matchedRoutes.length) {
      const { match, route } = matchedRoutes[0];
      //是否受登录限制
      if (route.needLogin !== undefined) {
        needLogin = route.needLogin;
      }
      if (route.component) {
        matched = route;
      }
    }

    if (location.pathname == rootPath && indexRoute.path != rootPath) {
      // 默认页面跳转逻辑 '/' to indexRoute.path              已经登录 或者不需要登录 跳转到 indexRoute.path
      // 否则跳转到登录页
      if (isLogin) {
        if (onceEditPwd) {
          const auth = new Auth();
          auth.get_menu().then(res => {
            if (res && res.success && res.result) {
              const { menu } = res.result;
              const route = findFirstLeaf(menu[0]);
              location.href = route.path;
            } else {
              location.href = "/login";
            }
          });
          return null;
        } else {
          return <Redirect to={"/once_password"} />;
        }
      } else {
        return <Redirect to={"/login"} />;
      }
    }

    const userAgent = navigator.userAgent;
    const isIE =
      userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
    const reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    const fIEVersion = parseFloat(RegExp["$1"]);
    const IE9OR10 = fIEVersion == 10.0 || fIEVersion == 9.0;

    const BrowserAlert = (
      <Alert
        message={
          <div>
            为了保障您正常使用，建议您使用新版本IE浏览器或Chrome浏览器
            <a
              target="_blank"
              alt="获取最新浏览器"
              href="http://support.microsoft.com/zh-cn/help/17621/internet-explorer-downloads"
            >
              IE浏览器最新版
            </a>
            <a
              target="_blank"
              href="http://down.tech.sina.com.cn/download/d_load.php?d_id=40975&down_id=9&ip=119.137.53.224"
            >
              Chrome浏览器
            </a>
          </div>
        }
        type="warning"
      />
    );
    return (
      <Layout>
        {isIE && IE9OR10 ? BrowserAlert : null}
        {needLogin ? (
          isLogin ? (
            onceEditPwd ? (
              <Layout>
                <Layout.Header>
                  <Header
                    root="/"
                    history={history}
                    location={history.location}
                    collapsed={this.state.collapsed}
                    toggle={this.toggle}
                  />
                </Layout.Header>
                <Body collapsed={this.state.collapsed} toggle={this.toggle} />
              </Layout>
            ) : (
              <Redirect to={"/once_password"} />
            )
          ) : (
            <Redirect to={"/login"} />
          )
        ) : (
          <Route path={location.pathname} component={matched.component} />
        )}
      </Layout>
    );
  }
}

export default APP;
