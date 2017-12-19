import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import ImportCustomerForm from "./importCustomerForm";

export default class EditDeclarationModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      formData: {}
    };
  }
  componentWillMount() {
  }
  componentDidMount() {}
  show(data = {}) {
    this.setState({ visible: true, formData: data });
  }

  renderFooterBtn() {
    const btns = [
      <Button
        key="cancel"
        onClick={this.handleClose}
      >
        关闭
      </Button>,
    ];
    return btns;
  }
  handleClose =()=>{
    this.setState({
      visible:false,
      formData:{}
    })
    this.customerForm.clean()
  }
  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"批量导入客户"}
        width={680}
        className={`vant-modal yundao-modal `}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}
      >
        <ImportCustomerForm
              ref={form => (this.customerForm = form)}
              data={this.state.formData}
              callback={this.props.callback}
            />
      </Modal>
    );
  }
}
