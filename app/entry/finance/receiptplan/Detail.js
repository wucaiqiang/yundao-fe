import React, { Component } from "react";
import { Spin, Breadcrumb } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import Detail from "services/finance/receiptplan/detail/Detail";

import Receipt from "model/Finance/receipt";

import Utils from "utils/";
import style from "./Index.scss";

export default class ReceiptPlanDetail extends Base {
  constructor(props) {
    super(props);

    const { location, match } = this.props;

    const { id } = match.params;
    const { search } = location;

    if (search) {
      let params = Utils.parseQuery(search);
      this.tab = params.tab;
    }

    this.state = {
      id: id,
      loading: true,
      visible: true
    };
  }
  componentWillMount() {
    this.receipt = new Receipt();
    this.loadData();
  }

  loadData = () => {
    const { id } = this.state;

    this.receipt.get(id).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        let data = res.result;
        data.activeKey = this.tab;

        this.setState({ data });
      } else {
        this.setState({ loading: false, error: true, message: res.message });
      }
    });
  };

  reloading = () => {
    this.setState({ loading: true });
    this.loadData();
  };

  render() {
    return (
      <Page {...this.props}>
        <div
          ref={ref => {
            if (ref) {
              const container = ref.parentNode.parentNode;
              this.affixContainer = container;
            }
          }}
        >
          <Breadcrumb className="page-breadcrumb">
            <Breadcrumb.Item>回款计划详情</Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-content">
            <Spin spinning={this.state.loading}>
              {this.state.error ? (
                <div className="error" onClick={this.reloading}>
                  {this.state.message},点击重新加载
                </div>
              ) : this.state.data ? (
                <Detail mod={this} data={this.state.data} />
              ) : null}
            </Spin>
          </div>
        </div>
      </Page>
    );
  }
}
