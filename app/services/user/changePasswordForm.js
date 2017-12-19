import React from "react";
import { Input, Form } from "antd";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

const FormItem = Form.Item;

class ChangePasswordForm extends Base {
  state = {
    confirmDirty: false
  };
  constructor() {
    super();

    this.formUtils = new FormUtils("changePasswordForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  checkPassword = (rule, value, callback) => {
    if (value && value !== this.formUtils.getFieldValue("newPassword")) {
      callback("两次输入密码不一致");
    } else {
      callback();
    }
  };
  checkConfirm = (rule, value, callback) => {
    if (value && this.state.confirmDirty) {
      this.formUtils.validateFields(["confirmPassword"], { force: true });
    }
    callback();
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
      <Form className={`float-slide-form vant-spin follow-form`}>
        <FormItem label="当前密码" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("oldPassword", {
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                message: "请输入当前密码"
              }
            ]
          })(<Input type="password" autoComplete="new-password" />)}
        </FormItem>
        <FormItem label="新密码" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("newPassword", {
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                message: "请输入新密码"
              },
              {
                message: "6-20位，不能是纯字母或纯数字",
                pattern: new RegExp(
                  "^(?![d]+$)(?![a-zA-Z]+$)(?![^da-zA-Z]+$).{6,20}$"
                )
              },
              {
                validator: this.checkConfirm
              }
            ]
          })(<Input type="password" autoComplete="new-password" />)}
        </FormItem>
        <FormItem label="确认密码" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("confirmPassword", {
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                message: "请输入确认密码"
              },
              {
                validator: this.checkPassword
              }
            ]
          })(
            <Input
              type="password"
              autoComplete="new-password"
              onBlur={this.handleConfirmBlur}
            />
          )}
        </FormItem>
      </Form>
    );
  }
}
const WrapperChangePasswordForm = Form.create()(ChangePasswordForm);

export default WrapperChangePasswordForm;
