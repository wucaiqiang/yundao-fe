import React from "react";
import PropTypes from "prop-types";
import { Checkbox, Button, Modal, Form, Input, Row, Col, Icon } from "antd";
import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import style from "./auditModal.scss";

const FormItem = Form.Item;
const TextArea = Input.TextArea;

class AuditForm extends React.Component {
  static defaultProps = {
    required: true
  };

  componentWillMount() {
    this.props.formUtils.setForm(this.props.form);
  }
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };
    return (
      <Form className={`float-slide-form vant-spin`}>
        <FormItem
          label={this.props.labelName || "驳回原因"}
          {...formItemLayout}
        >
          <Col>
            {this.props.formUtils.getFieldDecorator("reason", {
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: this.props.required,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过50个字符",
                  min: 1,
                  max: 50
                }
              ]
            })(<TextArea rows={3} />)}
          </Col>
        </FormItem>
      </Form>
    );
  }
}

const WrappedAuditForm = Form.create()(AuditForm);

export default class AuditModal extends Base {
  constructor() {
    super();
    this.state = {
      visible: false
    };

    this.formUtils = new FormUtils("auditForm");
  }
  show() {
    this.setState({ visible: true });
  }
  hide() {
    this.setState({ visible: false, confirmLoading: false }, () => {
      this.formUtils.resetFields();
    });
  }
  /**
   * 控制提交按钮状态
   */
  commit = confirmLoading => {
    this.setState({
      confirmLoading
    });
  };
  handleCancel = () => {
    this.hide();
  };
  handleOk = e => {
    this.formUtils.validateFields(errors => {
      if (!errors) {
        this.setState({
          confirmLoading: true
        });
        const values = this.formUtils.getFieldsValue();
        if (typeof this.props.callback === "function")
          this.props.callback(values, this);
      }
    });
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    return (
      <Modal
        visible={this.state.visible}
        closable={false}
        confirmLoading={this.state.confirmLoading}
        title={this.props.title || "驳回申请"}
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <WrappedAuditForm
          formUtils={this.formUtils}
          labelName={this.props.labelName}
          required={this.props.required}
        />
      </Modal>
    );
  }
}
