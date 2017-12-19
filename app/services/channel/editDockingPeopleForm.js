import React from "react";
import {
  Select,
  Input,
  DatePicker,
  Button,
  Form,
  Row,
  Col,
  Icon,
  Tooltip,
  Radio
} from "antd";
import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Channel from "model/Channel/";
import Dictionary from "model/dictionary";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

import style from "./editChannelModal.scss";

class EditDockingPeopleForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      dic: {}
    };

    this.formUtils = new FormUtils("EditDockingPeopleForm ");
  }
  componentWillMount() {
    this.channel = new Channel();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    const dictionary = new Dictionary();
    dictionary.gets("dic_sex").then(res => {
      if (res.success && res.result) {
        let dic = {};
        res.result.map(item => {
          dic[item.value] = item;
        });

        this.setState({ dic });
      }
    });
  }

  getDicSelections(ChildComponent, code) {
    return (
      this.state.dic[code] &&
      this.state.dic[code].selections &&
      this.state.dic[code].selections.map(item => {
        return (
          <ChildComponent value={item.value} key={item.value}>
            {item.label}
          </ChildComponent>
        );
      })
    );
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
        span: 17
      }
    };

    return (
      <div
        id="customer_form"
        style={{
          position: "relative"
        }}
      >
        <Form className={this.getFormClassName()}>
          <FormItem label="名称" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("name", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入1-20长度的名称",
                  min: 1,
                  max: 20
                }
              ]
            })(<Input placeholder="请输入名称" />)}
          </FormItem>

          <FormItem label="手机号码" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("mobile", {
              rules: [
                {
                  whitespace: true,
                  message: "请填写长度为6-20位",
                  min: 6,
                  max: 20
                }
              ],
              validateTrigger: "onBlur"
            })(<Input placeholder="请输入手机号码" />)}
          </FormItem>

          <FormItem label="座机号码" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("telephone", {
              initialValue: null,
              rules: [
                {
                  whitespace: true,
                  message: "请填写长度为6-20位",
                  min: 6,
                  max: 20
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="性别" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("sex", { initialValue: 0 })(
              <RadioGroup>{this.getDicSelections(Radio, "dic_sex")}</RadioGroup>
            )}
          </FormItem>
          <FormItem label="微信" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("wechat", {
              initialValue: null,
              rules: [
                {
                  whitespace: true,
                  message: "输入长度范围限制6-20位",
                  min: 6,
                  max: 20
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="出生日期" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("birthday")(
              <DatePicker
                style={{
                  width: 200
                }}
                format="YYYY-MM-DD"
              />
            )}
          </FormItem>

          <FormItem label="职务" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("position", {
              initialValue: null,
              rules: [
                {
                  whitespace: true,
                  message: "长度不能超过20个字符",
                  max: 20
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="邮箱" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("email", {
              initialValue: null,
              rules: [
                {
                  type: "email",
                  whitespace: true,
                  message: "邮箱格式不正确"
                },
                {
                  message: "长度不能超过50个字符",
                  max: 50
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="办公地址" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("address", {
              initialValue: null,
              rules: [
                {
                  whitespace: true,
                  message: "长度不能超过100个字符",
                  max: 100
                }
              ]
            })(<Input />)}
          </FormItem>
        </Form>
      </div>
    );
  }
}
EditDockingPeopleForm = Form.create()(EditDockingPeopleForm);

export default EditDockingPeopleForm;
