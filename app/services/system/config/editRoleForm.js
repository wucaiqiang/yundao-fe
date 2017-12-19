import React, { Component } from "react";
import {
  Select,
  Cascader,
  Input,
  DatePicker,
  Tag,
  Checkbox,
  Radio,
  Button,
  Table,
  Modal,
  Form,
  Menu,
  Pagination,
  Spin,
  message,
  Icon,
  Tabs,
  TreeSelect
} from "antd";
import FormUtils from "../../../lib/formUtils";
import utils from "../../../utils/";

import Role from "../../../model/Role/";
import User from "../../../model/User/";

const FormItem = Form.Item;

import Base from '../../../components/main/Base'

class EditRoleForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
    };
    this.formUtils = new FormUtils("editRoleForm");
    this.role = new Role();
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }

  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    return (
        <Form className={this.getFormClassName()}>
          <FormItem label="角色名称" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("name", {
              initialValue: this.props.data.realName,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过20个字符",
                  min: 1,
                  max: 20
                }
              ]
            })(<Input type="text" />)}
          </FormItem>
        </Form>
    );
  }
}
EditRoleForm = Form.create()(EditRoleForm);

export default EditRoleForm;
