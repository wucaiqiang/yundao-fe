import React, { Component } from "react";
import { Spin } from "antd";

import FloatPanelBase from "base/floatPanelBase";

// import ProductDetail from "./productDetail";

let ProductDetail = null;

import Product from "model/Product/";

class ProductDetailFloat extends FloatPanelBase {
  state = {
    loading: true,
    visible: false,
    showOnce: false
  };
  constructor(props) {
    super(props);
    this.product = new Product();
  }
  show = data => {
    const that = this;
    if (!this.state.showOnce) {
      require.ensure(["./productDetail"], function(require) {
        ProductDetail = require("./productDetail").default;
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
    const { open_source, id } = this.state.data;

    this.product.get_detail(id).then(res => {
      if (res.success) {
        let data = res.result;
        this.setState({ data, loading: false });
      } else {
        this.setState({ loading: false, error: true, message: res.message });
      }
    });
  };

  reloading = () => {
    this.setState({ loading: true });
    this.loadData();
  };

  hide() {
    this.setState({ visible: false });
  }

  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap");
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

export default ProductDetailFloat;
