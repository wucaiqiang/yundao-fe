import React from "react";
import ReactDom from "react-dom";
import {
  Select,
  Input,
  Form,
  DatePicker,
  InputNumber,
  Checkbox,
  Col
} from "antd";
import moment from "moment";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import style from "./addCashModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

class MyCheckBox extends React.Component {
  render() {
    return (
      <Checkbox checked={this.props.value} onChange={this.props.onChange}>
        {this.props.text}
      </Checkbox>
    );
  }
}

class AddCashForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false
    };

    this.formUtils = new FormUtils("addCashForm");
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
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    let { data } = this.props;

    let isInvoiced = this.formUtils.getFieldValue("isInvoiced");
    console.log(isInvoiced);

    return (
      <Form ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
        <FormItem style={{ display: "none" }}>
          {this.formUtils.getFieldDecorator("receiptPlanId", {
            initialValue: data.id
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="所属回款计划" {...formItemLayout}>
          {data.name}
        </FormItem>
        <FormItem label="回款金额" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("amount", {
            initialValue: null,
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                message: "请输入回款金额"
              },
              {
                pattern: new RegExp("^\\d+(\\.[1-9]{1,2})?$"),
                message: "必须大于0,最多两位小数"
              }
            ]
          })(<InputNumber min={0} />)}元
        </FormItem>
        <FormItem label="回款日期" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("payDate", {
            initialValue: null,
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                message: "请选择回款日期"
              }
            ]
          })(
            <DatePicker
              format="YYYY-MM-DD"
              getCalendarContainer={() => this.container}
            />
          )}
        </FormItem>
        <FormItem label="回款单位" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("payUnit", {
            rules: [
              {
                type: "string",
                whitespace: true,
                message: "请填写长度不超过50个字符",
                max: 50
              }
            ],
            validateTrigger: "onBlur"
          })(<Input />)}
        </FormItem>
        <FormItem label="回款银行" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("bankName", {
            rules: [
              {
                type: "string",
                whitespace: true,
                message: "请填写长度不超过50个字符",
                max: 50
              }
            ],
            validateTrigger: "onBlur"
          })(<Input />)}
        </FormItem>
        <FormItem label="回款账号" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("payAccount", {
            rules: [
              {
                type: "string",
                whitespace: true,
                message: "回款账号必须是数字",
                pattern: new RegExp("^[1-9]\\d*$")
              }
            ],
            validateTrigger: "onBlur"
          })(<Input />)}
        </FormItem>
        <FormItem label="开票信息" {...formItemLayout}>
          <Col span={6}>
            <FormItem>
              {this.formUtils.getFieldDecorator("isInvoiced", {
                initialValue: false
              })(<MyCheckBox text="已开票" />)}
            </FormItem>
          </Col>
          <Col span={18}>
            {isInvoiced ? (
              <FormItem label="开票时间" className="kaipianDate">
                {this.formUtils.getFieldDecorator("invoicedDate", {
                  rules: [
                    {
                      required: isInvoiced,
                      whitespace: false,
                      type: "object",
                      message: "请选择开票时间"
                    }
                  ]
                })(
                  <DatePicker
                    style={{
                      width: 120
                    }}
                    getCalendarContainer={() => this.container}
                  />
                )}
              </FormItem>
            ) : null}
          </Col>
        </FormItem>
        <FormItem label="备注" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("remark", {
            initialValue: null,
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                type: "string",
                whitespace: true,
                message: "请填写长度不超过200个字符",
                max: 200
              }
            ]
          })(<Input type="textarea" rows={3} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

AddCashForm = Form.create()(AddCashForm);

export default AddCashForm;
