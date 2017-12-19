import React from "react";
import {
  Select,
  Input,
  DatePicker,
  Button,
  Form,
  Row,
  InputNumber,
  Col,
  Icon,
  Radio
} from "antd";
import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Dictionary from "model/dictionary";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class SettleCommissionForm extends Base {
  constructor() {
    super();
    this.state = {
      filters: {}
    };

    this.formUtils = new FormUtils("SettleCommissionForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.dictionary = new Dictionary();
  }
  componentDidMount() {
    this.getDictionary();
  }

  getDictionary() {
    this.dictionary.gets("dic_knotcommission_type").then(res => {
      if (res.success && res.result) {
        let filters = {};
        res.result.map(item => {
          filters[item.value] = item.selections;
        });

        this.setState({ filters });
      }
    });
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

    const { dic_knotcommission_type } = this.state.filters;

    const { data } = this.props;

    const timestamp = new Date().getTime();

    return (
      <Form
        className={`float-slide-form vant-spin commission-form`}
        id={`SettleCommissionForm_${timestamp}`}
      >
        <FormItem
          label="报单编号"
          {...formItemLayout}
          style={{ marginBottom: 0 }}
        >
          {data.number}
          {this.formUtils.getFieldDecorator("declarationId", {
            initialValue: data.id
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="认购金额" {...formItemLayout}>
          {data.dealAmount}万元
        </FormItem>
        <FormItem label="佣金类型" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("type", {
            initialValue: "dic_knotcommission_type_front",
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                message: "请选择佣金类型"
              }
            ]
          })(
            <Select
              placeholder="请选择佣金类型"
              getPopupContainer={() =>
                document.getElementById(`SettleCommissionForm_${timestamp}`)
              }
              onChange={value => {
                this.formUtils.setFieldsValue({ rate: null, amount: null });
              }}
            >
              {dic_knotcommission_type &&
                dic_knotcommission_type.map(item => {
                  return (
                    <Option value={item.value} key={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem label="佣金费率" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("rate", {
            initialValue: null,
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                // type: "number",
                message: "请填写佣金费率"
              }
            ]
          })(<InputNumber precision={4} placeholder="请输入佣金费率" />)}%
        </FormItem>
        <FormItem label="佣金金额" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("amount", {
            initialValue: null,
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                // type: "number",
                message: "请填写佣金金额"
              }
            ]
          })(<InputNumber precision={2} placeholder="请输入佣金金额" />)}元
        </FormItem>
        <FormItem label="发放日期" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("provideDate", {
            validateTrigger: "onBlur",
            rules: [
              {
                required: true,
                message: "请选择发放日期"
              }
            ]
          })(<DatePicker placeholder="请选择发放日期" />)}
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
          })(<Input type="textarea" rows={4} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

SettleCommissionForm = Form.create()(SettleCommissionForm);

export default SettleCommissionForm;
