/**
 * 销售管理配置
 */
import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Tabs, Icon, Button, Modal, Tree, message } from "antd";

import Base from "../../../components/main/Base";
import Page from "../../../components/main/Page";

import CustomerLimitModal from "services/system/config/customerLimitModal";

import SystemModel from "model/System/index";

import style from "./Sale.scss";

export default class SystemConfigSale extends Base {
  static get NAME() {
    return "SystemConfigSale";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SystemConfigSale.NAME]) {
      this.context = context;
    }
    this.state = {
      customerLimit: {}
    };
  }
  componentWillMount() {
    const systemModel = new SystemModel();

    systemModel.get_sale().then(res => {
      if (res.success) {
        this.setState({ customerLimit: res.result.opensea });
      }
    });
  }
  handleEdit = () => {
    this.customerLimitModal.show(this.state.customerLimit);
  };
  handleUpdate = data => {
    this.setState({ customerLimit: data });
  };
  render() {
    const { customerLimit } = this.state;

    return (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item>销售管理配置</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={`page-content`}>
          <section>
            <div>
              <span className={style.title}>
                公海客户领取上限：{customerLimit.takeLimitEnable === 0
                  ? "不限制"
                  : customerLimit.takeLimitCount}
              </span>
              <Button className={style.action} onClick={this.handleEdit}>
                编辑
              </Button>
            </div>
            <div className={style.tip}>限制每个员工可以从公海中领取的客户数量上限</div>
          </section>
        </div>
        <CustomerLimitModal
          ref={ref => (this.customerLimitModal = ref)}
          callback={this.handleUpdate}
        />
      </Page>
    );
  }
}
