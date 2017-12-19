import React from "react";
import ReactDom from "react-dom";
import { Link } from "react-router-dom";

import { Input, DatePicker, Form, InputNumber, Radio, Row, Col } from "antd";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";

import moment from "moment";

import Product from "model/Product/";

import SearchSelect from "components/Form/SearchSelect";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class EditAppointmentForm extends Base {
  products = [];
  constructor() {
    super();
    this.state = {
      loading: false
    };

    this.formUtils = new FormUtils("EditAppointmentForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.product = new Product();
    this.customer = new Customer();
  }

  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }
  handleChangeProduct = value => {
    if (!value) {
      return;
    }
    const product = this.products[value.key];
    const { canReservation, notCanReservationTitle } = product;

    this.setState({ canReservation, notCanReservationTitle });

    this.props.onChange && this.props.onChange(canReservation);
  };

  render() {
    const { data, initFields, isEdit } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };

    const { canReservation = false, notCanReservationTitle } = this.state;

    return (
      <Form
        className={this.getFormClassName()}
        ref={ref => (this.container = ReactDom.findDOMNode(ref))}
      >
        {isEdit ? (
          <div>
            <FormItem label="产品名称" {...formItemLayout}>
              <div id={"productId_FormItem"}>
                {initFields && initFields.indexOf("productId") > -1 ? (
                  <div>{data.productName}</div>
                ) : (
                  <SearchSelect
                    placeholder="请输入并选择产品"
                    request={this.product.get_appointment_product}
                    format={r => {
                      r.value = r.id;
                      r.label = r.name;
                      this.products[r.id] = r;
                      return r;
                    }}
                    callback={this.handleChangeProduct}
                    formUtils={this.props.formUtils}
                    name="productId"
                    initData={{
                      label: data.productName,
                      value: data.productId
                    }}
                  />
                )}
                {this.formUtils.getFieldDecorator("productId", {
                  initialValue: data.productId,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [{ required: true, message: "请输入并选择产品" }]
                })(<Input type="hidden" />)}
              </div>
            </FormItem>
            {notCanReservationTitle ? (
              <FormItem label="    " {...formItemLayout}>
                {notCanReservationTitle}

                {notCanReservationTitle.indexOf("直接报单") > -1 ? (
                  <Link to="/sale/declaration">去报单</Link>
                ) : null}
              </FormItem>
            ) : canReservation || data.productId ? (
              <div>
                <FormItem
                  label=""
                  {...formItemLayout}
                  style={{ display: "none" }}
                >
                  {this.formUtils.getFieldDecorator("source", {
                    initialValue: null
                  })(<Input type="hidden" />)}
                </FormItem>
                <FormItem
                  label=""
                  {...formItemLayout}
                  style={{ display: "none" }}
                >
                  {this.formUtils.getFieldDecorator("channelId", {
                    initialValue: null
                  })(<Input type="hidden" />)}
                </FormItem>
                <FormItem label="客户/渠道" {...formItemLayout}>
                  <div id={"customerId_FormItem"}>
                    <SearchSelect
                      placeholder="请输入并选择客户或渠道"
                      request={this.customer.get_selection}
                      format={r => {
                        r.value = r.id;
                        r.label = `${r.name}(${r.mobile})`;
                        return r;
                      }}
                      formUtils={this.props.formUtils}
                      name="customerId"
                      initData={{
                        label: data.customerName,
                        value: data.customerId
                      }}
                      callback={value => {
                        this.formUtils.setFieldsValue({
                          source: value ? value.source : null,
                          channelId: value ? value.id : null
                        });
                      }}
                    />
                    {this.formUtils.getFieldDecorator("customerId", {
                      initialValue: data.customerId
                        ? data.customerId.toString()
                        : null,
                      rules: [
                        {
                          validateTrigger: ["onChange", "onBlur"],
                          required: true,
                          message: "请输入并选择客户或渠道"
                        }
                      ]
                    })(<Input type="hidden" />)}
                  </div>
                </FormItem>
                {this.formUtils.getFieldValue("source") === 2 ? (
                  <div>
                    <Row>
                      <Col span={7} />
                      <Col span={17}>
                        您选择的是渠道，请选择该渠道出单的类型
                      </Col>
                    </Row>
                    <FormItem label="   " {...formItemLayout}>
                      {this.formUtils.getFieldDecorator("customerType", {
                        initialValue: "1"
                      })(
                        <RadioGroup>
                          <Radio value={"1"} key={"1"}>
                            为个人出单
                          </Radio>
                          <Radio value={"2"} key={"2"}>
                            为机构出单
                          </Radio>
                        </RadioGroup>
                      )}
                    </FormItem>
                  </div>
                ) : null}
                <FormItem label="预计打款日期" {...formItemLayout}>
                  {this.formUtils.getFieldDecorator("estimatePayDate", {
                    initialValue: data.estimatePayDate
                      ? moment(data.estimatePayDate)
                      : null,
                    validateTrigger: ["onChange", "onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请选择预计打款日期"
                      }
                    ]
                  })(
                    <DatePicker
                      format="YYYY-MM-DD"
                      getCalendarContainer={() => this.container}
                    />
                  )}
                </FormItem>
                <FormItem label="预约金额" {...formItemLayout}>
                  {this.formUtils.getFieldDecorator("reservationAmount", {
                    initialValue: data.reservationAmount,
                    validateTrigger: ["onChange", "onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入预约金额"
                      }
                    ]
                  })(<InputNumber />)}万
                </FormItem>
                <FormItem label="备注" {...formItemLayout}>
                  {this.formUtils.getFieldDecorator("remark", {
                    initialValue: data.remark,
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
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <FormItem label="产品名称" {...formItemLayout}>
              {data.productName}
            </FormItem>
            <FormItem label="客户/渠道" {...formItemLayout}>
              {data.customerName}
            </FormItem>
            <FormItem label="预计打款日期" {...formItemLayout}>
              {moment(data.estimatePayDate).format("YYYY-MM-DD")}
            </FormItem>
            <FormItem label="预约金额" {...formItemLayout}>
              {data.reservationAmount}
            </FormItem>
            <FormItem label="备注" {...formItemLayout}>
              {data.remark}
            </FormItem>
          </div>
        )}
      </Form>
    );
  }
}
EditAppointmentForm = Form.create()(EditAppointmentForm);

export default EditAppointmentForm;
