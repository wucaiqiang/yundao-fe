import React from "react";
import ReactDom from "react-dom";
import { Select, Input, DatePicker, Button, Form, Row, Col, Icon } from "antd";
import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Dictionary from "model/dictionary";

const FormItem = Form.Item;
const Option = Select.Option;

import style from './customerFollowForm.scss'

class CustomerFollowForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      dictionary: {
        dic_follow_up_type: [],
      }
    };

    this.formUtils = new FormUtils("customerFollowForm");
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.getDictionary();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  getDictionary() {
    this.dictionary
      .gets("dic_follow_up_type")
      .then(res => {
        if (res.success && res.result) {
          let dictionary = {};
          res.result.map(item => {
            dictionary[item.value] = item.selections;
          });

          this.setState({ dictionary });
        }
      });
  }
  getOptions = data => {
    return data.map(item => {
      return (
        <Option key={item.value} value={item.value.toString()}>
          {item.label}
        </Option>
      );
    });
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    };
    const { dic_follow_up_type } = this.state.dictionary;
    return (
      <div ref={ref => (this.container = ReactDom.findDOMNode(ref))} className={style.follow}>
        <Form>
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("customerId", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="跟进方式" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("type", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请选择跟进方式"
                }
              ]
            })(
              <Select size="large" getPopupContainer={() => this.container}>
                {this.getOptions(dic_follow_up_type)}
              </Select>
            )}
          </FormItem>
          <FormItem label="跟进内容" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("content", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过200个字符",
                  min: 1,
                  max: 200
                }
              ]
            })(<Input type="textarea" rows={3} size="large" />)}
          </FormItem>
          <FormItem label="下次跟进时间" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("nextFollowDate", {})(
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择下次跟进时间"
                showTime={true}
                getCalendarContainer={() => this.container}
              />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}
CustomerFollowForm = Form.create()(CustomerFollowForm);

export default CustomerFollowForm;
