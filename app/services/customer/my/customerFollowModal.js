import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import CustomerFollowForm from "./customerFollowForm";

import Customer from "model/Customer";

import style from "./customerFollowModal.scss";

export default class CustomerFollowModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      confirmLoading: false
    };

    this.formUtils = new FormUtils("customerFollowModal");
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {}
  show(data) {
    this.setState(
      {
        visible: true
      },
      () => {
        this.formUtils.resetFields();
        this.formUtils.setFieldsValue({ customerId: data.id });
      }
    );
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  handleOk = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.setState({ confirmLoading: true });

        this.customer.follow(formData).then(res => {
          this.setState({ confirmLoading: false });

          if (res.success) {
            message.success("添加跟进成功");
            this.setState(
              {
                visible: false
              },
              () => {
                this.formUtils.resetFields();
              }
            );

            if (this.props.reload) {
              this.props.reload();
            }
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
  render() {
    let { visible, confirmLoading } = this.state;
    return (
      <Modal
        visible={visible}
        title="跟进客户"
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        okText="发布"
        confirmLoading={confirmLoading}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <CustomerFollowForm
          ref={form => (this.customerFollowForm = form)}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
