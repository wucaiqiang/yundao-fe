import React from "react";
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Icon,
  Modal,
  Spin,
  message
} from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Declaration from "model/Declaration";

import style from "../appointment/auditRecordModal.scss";

const FormItem = Form.Item;

class DiscardForm extends Base {
  constructor() {
    super();
    this.formUtils = new FormUtils("DiscardForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  render() {
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    return (
      <Form className={`float-slide-form vant-spin follow-form`}>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="作废原因" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("reason", {
            initialValue: "",
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                type: "string",
                whitespace: true,
                message: "请填写长度不超过30个字符",
                min: 1,
                max: 30
              }
            ]
          })(<Input type="textarea" rows={3} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

const WrappedDiscardForm = Form.create()(DiscardForm);

export default class DiscardModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false
    };

    this.formUtils = new FormUtils("DiscardModal");
  }
  componentWillMount() {
    this.declaration = new Declaration();
  }
  componentDidMount() {}
  show(data) {
    this.setState(
      {
        visible: true
      },
      () => {
        this.formUtils.setFieldsValue(data);
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

        this.declaration.discard(formData).then(res => {
          if (res.success) {
            message.success("作废操作成功");
            this.setState(
              {
                visible: false
              },
              () => {
                this.formUtils.resetFields();
              }
            );

            if (this.props.callback) {
              this.props.callback();
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
        values[key] = v;
      }
    }
    return values;
  }
  render() {
    let { visible, formData } = this.state;
    return (
      <Modal
        visible={visible}
        title="作废"
        width={415}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div className="ant-confirm-body-wrapper">
          <div className="ant-confirm-body">
            <i className="anticon anticon-exclamation-circle" />
            <span className="ant-confirm-title">报单作废后不可恢复，确定作废？</span>
            <div className="ant-confirm-content">
              <WrappedDiscardForm
                ref={form => (this.DiscardForm = form)}
                formUtils={this.formUtils}
                setForm={form => (this.form = form)}
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
