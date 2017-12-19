import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";

import Base from "components/main/Base";
import ImportChannelForm from "./importChannelForm";

export default class ImportChannelModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      formData: {}
    };
  }
  componentWillMount() {}
  componentDidMount() {}
  show(data = {}) {
    this.setState({ visible: true, formData: data });
  }

  renderFooterBtn() {
    const btns = [
      <Button key="cancel" onClick={this.handleClose}>
        关闭
      </Button>
    ];
    return btns;
  }
  handleClose = () => {
    this.setState({
      visible: false,
      formData: {}
    });
    this.customerForm.clean();
  };
  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"批量导入渠道"}
        width={600}
        className={`vant-modal yundao-modal `}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        footer={this.renderFooterBtn()}
      >
        <ImportChannelForm
          ref={form => (this.customerForm = form)}
          data={this.state.formData}
          callback={this.props.callback}
        />
      </Modal>
    );
  }
}
