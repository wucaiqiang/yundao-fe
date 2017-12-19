import React from "react";
import { Button, Modal, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";

import EditContactForm from "./editContactForm";

import style from "./editCustomerModal.scss";

export default class EditContactModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      formData: {},
    };

    this.formUtils = new FormUtils("editCustomerModal");
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {}
  show(data = {}) {

    this.setState({ formData, visible: true }, () => {
      this.formUtils.resetFields();
      this.formUtils.setFieldsValue(formData);
    });
  }
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.request(formData).then(res => {
          if (res.success) {
            this.setState({
              visible: false
            });
            message.success("新增联系人成功.");
            this.props.reload();
          }
        });
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
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = v.format("YYYY-MM-DD");
        }
        if (v instanceof Array) {
          if (v.length > 0 && v[0] instanceof moment) {
            v = v.map(item => item.format("YYYY-MM-DD"));
          } else {
            v = v.join(",");
          }
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        values[key] = v;
      }
    }
    return values;
  }
  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"新增联系人"}
        width={680}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showFloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
      >
        <EditContactForm
          ref={form => (this.customerForm = form)}
          formUtils={this.formUtils}
          visible={visible}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
