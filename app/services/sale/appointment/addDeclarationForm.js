import React from "react";
import ReactDom from "react-dom";
import { Select, Input, DatePicker, Button, Form, InputNumber } from "antd";

import SearchSelect from "components/Form/SearchSelect";

import moment from "moment";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

import Appoint from "model/Appoint/";
import Customer from "model/Customer/";

const FormItem = Form.Item;
const Option = Select.Option;

class EditDeclarationForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      my_appoint: [],
      current_appoint: {}
    };

    this.formUtils = new FormUtils("EditDeclarationForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.appoint = new Appoint();

    this.customer = new Customer()

    let { data = {}, initFields } = this.props;

    // if (!initFields) {
    //   this.loadAppoint(data.productId);
    // }
  }
  /**
   * 加载已确认的预约数据
   *
   * @memberof EditDeclarationForm
   */
  loadAppoint = productId => {
    this.appoint.get_my_select(productId).then(res => {
      if (res.success) {
        this.setState({
          my_appoint: res.result || [],
          current_appoint: res.result && res.result.length? res.result[0]:{}
        });

        if(res.result && res.result.length){
          this.formUtils.setFieldsValue({
            'dealAmount':res.result[0].reservationAmount
          })
        }
      }
    });
  };
  changeAppoint = value => {
    const list = this.state.my_appoint;
    list.map(item => {
      if (item.id == value) {
        this.formUtils.setFieldsValue({
          'dealAmount':item.reservationAmount
        })
        this.setState({
          current_appoint: item
        });

          return;
        }
      });
  };
  render() {
    const { data, initFields } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    const canDeclarationDirect = data.declarationModel == 1?true:false

    return (
      <Form
        className={`float-slide-form vant-spin follow-form`}
        ref={ref => (this.container = ReactDom.findDOMNode(ref))}
      >
        <FormItem label="预约"  {...formItemLayout}>
          {data.reservationAmount}万 {moment(data.estimatePayDate).format(
                "YYYY-MM-DD"
              )}
        </FormItem>
        <FormItem label="产品名称" {...formItemLayout}>
          {initFields && initFields.indexOf("productName") > -1 ? (
            data.productName
          ) : (
            this.state.current_appoint.productName || "请选择预约"
          )}
           {this.formUtils.getFieldDecorator("productId", {
          initialValue:data.productId,
          validateTrigger: ["onChange", "onBlur"]
        })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="客户名称" {...formItemLayout}>
          {initFields && initFields.indexOf("customerName") > -1 ? (
            data.customerName
          ) : (
            this.state.current_appoint.customerName || "请选择预约"
          )}
        </FormItem>
        <FormItem label="打款日期" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("payDate", {
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                message: "请选择打款日期"
              }
            ]
          })(
            <DatePicker
              format="YYYY-MM-DD"
              getCalendarContainer={() => this.container}
            />
          )}
        </FormItem>
        <FormItem label="认购金额" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("dealAmount", {
            initialValue:data.reservationAmount,
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                message: "请输入认购金额"
              }
            ]
          })(<InputNumber />)}万
        </FormItem>
        <FormItem label="备注" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("remark", {
            initialValue: "",
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                type: "string",
                whitespace: true,
                message: "请填写长度不超过200个字符",
                min: 1,
                max: 200
              }
            ]
          })(<Input type="textarea" rows={3} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}
EditDeclarationForm = Form.create()(EditDeclarationForm);

export default EditDeclarationForm;
