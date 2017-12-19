import React, { Component } from "react";
import ReactDOM from "react-dom";

import { Icon, Button, message, Modal, Row, Table, Col, Spin } from "antd";
import ClassNames from "classnames";

import Base from "components/main/Base";

import Fund from "model/Assets/fund";

class ImportProductModal extends Base {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }
  show(data) {
    this.setState({ visible: true, data });
  }
  hide = () => {
    this.setState({ visible: false });
  };
  loading(loading = true) {
    this.setState({ loading });
  }
  handleSubmit = () => {
    const { id } = this.state.data;
    const fund = new Fund();
    this.setState({
      submiting: true
    });
    fund.import_product(id).then(res => {
      this.setState({
        submiting: false
      });
      if (res.success) {
        this.props.callback && this.props.callback();
        this.hide();
      }
    });
  };
  render() {
    return (
      <Modal
        visible={this.state.visible}
        className="vant-modal autoheight  yundao-modal"
        maskClosable={false}
        wrapClassName="vertical-center-modal"
        onCancel={this.hide}
        title="导入财富管理"
        footer={[
          <Button key="close" onClick={this.hide}>
            取消
          </Button>,
          <Button
            key="save"
            loading={this.state.submiting}
            type="primary"
            onClick={this.handleSubmit}
          >
            确定
          </Button>
        ]}
        {...this.props}
      >
        <div>
          {this.state.loading ? <Spin /> : null}
          <p>导入财富管理后，该基金将复制到财富管理的产品管理中，可进行：</p>
          <div
            style={{
              paddingTop: 15,
              paddingBottom: 15
            }}
          >
            <p>1、上线、启动募集等操作</p>
            <p>2、接受预约和报单</p>
            <p>3、发布公告</p>
          </div>
          <p
            style={{
              fontSize: "14px"
            }}
          >
            导入后请到产品管理中补充资料，进行募集相关操作
          </p>
        </div>
      </Modal>
    );
  }
}

export default ImportProductModal;
