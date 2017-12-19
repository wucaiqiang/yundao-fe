import React, { Component } from "react";
import { Spin } from "antd";

import FloatPanelBase from "base/floatPanelBase";

import DetailIndex from "./index.js";

import Assets from "model/Assets/index";
import Declaration from "model/Declaration/";

export default class DetailFloatPanel extends FloatPanelBase {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
    this.assets = new Assets();
  }
  show = data => {
    this.visible();
    this.setState({ loading: true, data }, () => {
      this.loadData();
    });
  };

  loadData = () => {
    const { id, activeKey } = this.state.data;
    return this.assets.get(id).then(res => {
      if (res.success) {
        let data = res.result;

        data.id = id;
        data.activeKey = activeKey;

        this.setState({
          data,
          id,
          loading: false,
          error: false
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

  reload = () => {

    this.loadData();

    this.props.root && this.props.root.reload();
  };

  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap float-declaration-detail-wrap");
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
      <div className={this.getDetailClass()} ref={ref=>{
        if(ref){
          this.container = ref
        }
      }}>
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
              <div onClick={this.loadData}>数据有误，点击尝试重新加载</div>
            ) : this.state.data ? (
              <DetailIndex mod={this} data={this.state.data} />
            ) : null}
          </div>
        )}
      </div>
    );
  }
}
