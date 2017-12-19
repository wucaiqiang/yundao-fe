import React, { Component } from "react";
import { Spin, Breadcrumb } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import ProductDetail from "services/product/control/detail/productDetail";

import Product from "model/Product/";

import style from "./Index.scss";

class ProductDetailIndex extends Base {
  state = {
    loading: true,
    visible: true
  };
  constructor(props) {
    super(props);
    this.product = new Product();

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
    this.product.get_detail(id).then(res => {
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
            <Breadcrumb.Item>产品详情</Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-content">
            <Spin spinning={this.state.loading}>
              {this.state.error ? (
                <div className="error" onClick={this.reloading}>
                  {this.state.message},点击重新加载
                </div>
              ) : this.state.data ? (
                <ProductDetail mod={this} data={this.state.data} />
              ) : null}
            </Spin>
          </div>
        </div>
      </Page>
    );
  }
}

export default ProductDetailIndex;
