import React, { Component } from "react";
import { Spin } from "antd";

import FloatPanelBase from "base/floatPanelBase";

import Detail from "./Detail";

import Receipt from "model/Finance/receipt";

export default class DetailFloatPanel extends FloatPanelBase {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
    this.receipt = new Receipt();
  }
  show = data => {
    this.visible();
    this.setState({ visible: true, loading: true, data }, () => {
      this.loadData();
    });
  };

  loadData = () => {
    const { id } = this.state.data;
    return this.receipt.get(id).then(res => {
      if (res.success) {
        let data = res.result;
        this.setState({
          data,
          loading: false
        });
      } else {
        this.setState({
          loading: false,
          error: true
        });
      }
      return res;
    });
  };

  reloading = () => {
    // this.setState({
    //   loading: true
    // });
    this.loadData();

    this.props.reload && this.props.reload();
  };

  hide() {
    this.setState({ visible: false });
  }

  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap float-plan-detail-wrap");
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
        ) : (
          <div
            className="float-detail"
            ref={ref => {
              if (ref) {
                this.affixContainer = ref;
              }
            }}
          >
            {this.state.error ? (
              <div onClick={this.reloading}>数据有误，点击尝试重新加载</div>
            ) : this.state.data ? (
              <Detail mod={this} data={this.state.data} />
            ) : null}
          </div>
        )}
      </div>
    );
  }
}
