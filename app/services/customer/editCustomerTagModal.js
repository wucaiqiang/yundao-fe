import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";

import EditCustomerTagForm from "./editCustomerTagForm";

import style from "./editCustomerTagForm.scss";

export default class EditCustomerModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("editCustomerTagModal");
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {}
  show(formData = {}) {
    console.log('formData',formData)
    this.setState(
      {
        formData,
        visible: true
      },
      () => {
        this.formUtils.resetFields();
        this.formUtils.setFieldsValue(formData);
      }
    );
  }
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();
    this.formUtils.validateFields(errors => {
      if (!errors) {
        let error = false;
        let formData = this.formUtils.getFieldsValue();
        formData.tags.split(",").map(item => {
          if (item.length > 8) {
            error = true;
            message.error(`单个标签(${item})的长度不超过8`);
          }
        });
        if (!error) {
          this.setState({ visible: false }, () => {
            this.formUtils.resetFields();
          });
          this.props.submit && this.props.submit(formData);
        }
      }
    });
  };

  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm:ss");
        }
        values[key] = v;
      }
    }
    return values;
  }
  renderFooterBtn() {
    const btns = [
      <Button key="cancel" onClick={this.handleClose}>
        {" "}
        取消{" "}
      </Button>,
      <Button type="primary" key="submit" onClick={this.handleSubmit}>
        确定
      </Button>
    ];
    return btns;
  }
  render() {
    let { visible, formData } = this.state;
    return (
      <Modal
        visible={visible}
        title={"编辑标签"}
        width={500}
        className={`vant-modal  yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal showfloat"
        onCancel={this.handleClose}
        closable={false}
        maskClosable={false}
        footer={this.renderFooterBtn()}
      >
        <EditCustomerTagForm
          ref={form => (this.customerForm = form)}
          formUtils={this.formUtils}
          checkedTags={formData && formData.tags && formData.tags.split(",")}
          setForm={form => (this.form = form)}
          callback={this.props.callback}
        />
      </Modal>
    );
  }
}
