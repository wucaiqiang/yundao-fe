import React, { Component } from "react";
import { Spin } from "antd";

import FloatPanelBase from "base/floatPanelBase";

import Fund from "model/Assets/fund";

let ProductDetail = null;

export default class FundFloatPane extends FloatPanelBase {
  state = {
    loading: true,
    visible: false,
    showOnce: false
  };
  constructor(props) {
    super(props);
    this.fund = new Fund();
  }
  show = data => {
    const that = this;
    if (!this.state.showOnce) {
      require.ensure(["./index"], function(require) {
        ProductDetail = require("./index").default;
        that.setState(
          {
            showOnce: true
          },
          () => {
            that.setVisible(data);
          }
        );
      });
    } else {
      this.setVisible(data);
    }
  };

  setVisible = data => {
    this.visible();
    this.setState(
      {
        loading: true,
        data
      },
      () => {
        this.loadData();
      }
    );
  };

  /**
   * 刷新从子组件更新数据
   */
  updateData = data => {
    this.setState({ data });
  };

  loadData = () => {
    const { id, activeKey } = this.state.data;
    return this.fund.get(id).then(res => {
      if (res.success) {
        let data = res.result;
        data.activeKey = activeKey;

        this.setState({ data, loading: false, error: false });
      } else {
        this.setState({ loading: false, error: true, message: res.message });
      }
    });
  };

  /**
   * 刷新根组件列表
   */
  refreshRootList = () => {
    const { reload } = this.props;
    reload && reload();
  };

  hide() {
    this.setState({ visible: false });
  }

  reloading = () => {
    this.setState({ loading: true });
    this.loadData();
  };

  getDetailClass() {
    let cls, detail;

    cls = ["float-detail-wrap"];

    if (this.state.visible) {
      cls.push("open");
    }
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }

  render() {
    return (
      <div className={this.getDetailClass()}>
        {this.state.loading ? (
          <Spin />
        ) : this.state.data ? (
          <div
            className="float-detail"
            ref={ref => {
              if (ref) {
                this.affixContainer = ref;
              }
            }}
          >
            {this.state.error ? (
              <div onClick={this.reloading}>
                {this.state.message},点击重新加载
              </div>
            ) : (
              <ProductDetail mod={this} data={this.state.data} />
            )}
          </div>
        ) : null}
      </div>
    );
  }
}
