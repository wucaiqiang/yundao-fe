import React, { Component } from "react";
import { Select, Radio, Input, InputNumber, Modal, Form, message } from "antd";
import FormUtils from "../../../lib/formUtils";

import Base from "../../../components/main/Base";

import SystemModel from "model/System/index";
import Dictionary from "model/dictionary";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import style from "./editUserModal.scss";
class CustomerLimitForm extends Base {
  constructor() {
    super();
    this.state = {
      options: []
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();

    this.formUtils = this.props.formUtils || new FormUtils("customerLimitForm");
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    this.getDictionary();
  }
  getDictionary() {
    this.dictionary.gets("dic_conf_sale_opensea_limit").then(res => {
      if (res.success && res.result) {
        res.result.map(item => {
          if (item.value === "dic_conf_sale_opensea_limit") {
            let options = item.selections.map(item => {
              item.value = +item.value;
              return item;
            });
            this.setState({ options });
          }
        });
      }
    });
  }
  render() {
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    };

    let enable = this.formUtils.getFieldValue("takeLimitEnable") === 1;

    return (
      <Form className={`float-slide-form vant-spin follow-form`}>
        <FormItem label="是否限制" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("takeLimitEnable", {
            initialValue: 0
          })(<RadioGroup options={this.state.options} />)}
        </FormItem>
        {enable ? (
          <FormItem label="限制数量" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("takeLimitCount", {
              initialValue: this.props.formData.takeLimitCount,
              rules: [
                {
                  required: true,
                  message: "请输入限制数"
                }
              ]
            })(<InputNumber min={0} max={999999999} style={{ width: 140 }} />)}
          </FormItem>
        ) : null}
      </Form>
    );
  }
}

const WrappedCustomerLimitForm = Form.create()(CustomerLimitForm);

export default class CustomerLimitModal extends Base {
  constructor() {
    super();
    this.state = {
      visible: false,
      formData: {}
    };
    this.formUtils = new FormUtils("customerLimitModal");
  }
  componentWillMount() {}
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show(data) {
    this.setState(
      {
        visible: true,
        formData: data
      },
      () => {
        this.formUtils.setFieldsValue(data);
      }
    );
  }

  handleSubmit = e => {
    e && e.preventDefault();

    const systemModel = new SystemModel();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let data = this.formUtils.getFieldsValue();

        systemModel.update_sale(data).then(res => {
          if (res.success) {
            message.success("保存成功");
            this.setState({ visible: false });

            if (this.props.callback) {
              this.props.callback(data);
            }
          }
        });
      }
    });
  };
  render() {
    return (
      <Modal
        visible={this.state.visible}
        title="公海客户领取上限"
        maskClosable={false}
        closable={false}
        width={450}
        className={`vant-modal ${style.edit_user_modal} yundao-modal`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <WrappedCustomerLimitForm
          formData={this.state.formData}
          ref={form => (this.customerLimitForm = form)}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
