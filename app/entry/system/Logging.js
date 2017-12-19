/**
 * 权限调整日志
 */
import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Icon, message } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import style from "./config/Role.scss";

export default class SystemLogging extends Base {
  static get NAME() {
    return "SystemLogging";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SystemLogging.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true
    };
  }
  componentWillMount() {}
  render() {
    return (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item>登录记录</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={`page-content ${style.content}`} />
      </Page>
    );
  }
}
