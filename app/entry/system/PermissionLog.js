/**
 * 权限调整日志
 */
import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Tabs, Icon, Button, Modal, Tree, message } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";


import style from "./config/Role.scss";

export default class SystemPermissionLog extends Base {
  static get NAME() {
    return "SystemPermissionLog";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SystemPermissionLog.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
    };
  }
  componentWillMount() {
  }
  render() {
    let { activeTabKey, role } = this.state;
    const activeRoleId = role && role.id;
    return (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item>权限调整日志</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={`page-content ${style.content}`}>
        </div>
      </Page>
    );
  }
}
