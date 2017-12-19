import React from "react";
import { Select, Input, DatePicker, Button, Form, Radio } from "antd";
import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";
import Dictionary from "model/dictionary";

import style from "./editCustomerModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;
const Textarea = Input.Textarea;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;

class EditContactForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      noticeType: [],
      showExtra: false,
      dic: {},
      category: []
    };

    this.formUtils = new FormUtils("EditContactForm");
  }
  componentWillMount() {
    this.notice = new Notice();
    this.customer = new Customer();
    this.setState({ noticeType: this.props.noticeType });

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    const dictionary = new Dictionary();
    dictionary
      .gets("dic_sex,dic_org_credentials_type,dic_nationality")
      .then(res => {
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
                  message: "请输入1-10长度的名称",
                  min: 1,
                  max: 10
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
          <FormItem label="性别" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("sex", { initialValue: 0 })(
              <RadioGroup>{this.getDicSelections(Radio, "dic_sex")}</RadioGroup>
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

          <FormItem
            label={
              <a
                style={{
                  cursor: "pointer",
                  display: "inline"
                }}
                onClick={e => {
                  this.setState({
                    showExtra: !this.state.showExtra
                  });
                }}
              >
                {!this.state.showExtra ? "填写更多信息>>" : "收起"}
              </a>
            }
            {...formItemLayout}
          />
          {this.state.showExtra ? (
            <div
              style={{
                display: this.state.showExtra ? "block" : "none"
              }}
            >
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

              <FormItem label="办公地址" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("officeAddress", {
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
              <FormItem label="办公邮编" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("sadf", {
                  initialValue: null
                })(<Input />)}
              </FormItem>
              <FormItem label="国籍" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("nationality", {
                  initialValue: null
                })(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    placeholder="请选择国籍"
                    allowClear={true}
                    size="large"
                  >
                    {this.getDicSelections(Option, "dic_nationality")}
                  </Select>
                )}
              </FormItem>
              <FormItem label="证件类型" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("card")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    placeholder="请选择证件类型"
                    allowClear={true}
                    size="large"
                  >
                    {this.getDicSelections(Option, "dic_org_credentials_type")}
                  </Select>
                )}
              </FormItem>
              <FormItem label="证件号码" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("cardId", {
                  initialValue: null,
                  rules: [
                    {
                      whitespace: true,
                      message: "输入长度限制6-20位",
                      min: 6,
                      max: 20
                    }
                  ]
                })(<Input />)}
              </FormItem>
              <FormItem label="证件有效期" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("expireDate", {
                  initialValue: null
                })(<RangePicker format={"YYYY-MM-DD"} />)}
              </FormItem>
              <FormItem label="与该机构关系" {...formItemLayout}>
                {this.formUtils.getFieldDecorator(
                  "qualificationCertificateNumber",
                  {
                    initialValue: null,
                    rules: [
                      {
                        whitespace: true,
                        message: "长度不能超过50个字符",
                        max: 50
                      }
                    ]
                  }
                )(<Input />)}
              </FormItem>
            </div>
          ) : null}
        </Form>
      </div>
    );
  }
}
EditContactForm = Form.create()(EditContactForm);

export default EditContactForm;
