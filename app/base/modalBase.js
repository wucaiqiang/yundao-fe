import React, { Component } from "react";
import { Modal, Spin } from "antd";

class ModalBase extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }
  show() {
    this.setState({ visible: true });
  }
  hide=()=>{
    this.setState({ visible: false });
  }
  loading(loading = true) {
    this.setState({ loading });
  }
  render() {
    return (
      <Modal
        visible={this.state.visible}
        className="vant-modal autoheight  yundao-modal"
        maskClosable={false}
        wrapClassName="vertical-center-modal"
        onCancel={this.hide}
        {...this.props}
      >
        {this.state.loading ? <Spin /> : null}
        {this.props.children}
      </Modal>
    );
  }
}

export default ModalBase;
