import React, { Component } from "react";
import { Spin, Breadcrumb } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
// import FundDetail from "services/product/control/detail/productDetail";
import FundDetail from "services/assets/fund/detail/index";

import Fund from "model/Assets/fund";

import style from "./Index.scss";

class FundDetailIndex extends Base {
  state = {
    loading: true,
    visible: true
  };
  constructor(props) {
    super(props);
    this.fund = new Fund();

    const { location, match } = this.props;

    const { id } = match.params;

    this.state = {
      id: id,
      visible: true
    };
  }
  componentWillMount() {
    this.loadData();
  }

  loadData = () => {
    const { id } = this.state;
    return this.fund.get(id).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        let data = res.result;
        data.id = id;
        this.setState({ data, id });
      } else {
        this.setState({ loading: false, error: true, message: res.message });
      }
    });
  };
  /**
   * 刷新从子组件更新数据
   */
  updateData = data => {
    this.setState({ data });
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
            <Breadcrumb.Item>基金详情</Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-content">
            <Spin spinning={this.state.loading}>
              {this.state.error ? (
                <div className="error" onClick={this.reloading}>
                  {this.state.message},点击重新加载
                </div>
              ) : this.state.data ? (
                <FundDetail mod={this} data={this.state.data} />
              ) : null}
            </Spin>
          </div>
        </div>
      </Page>
    );
  }
}

export default FundDetailIndex;
