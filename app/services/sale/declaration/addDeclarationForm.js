import React from "react";
import ReactDom from "react-dom";
import { Select, Input, DatePicker, Button, Form, InputNumber } from "antd";

import SearchSelect from "components/Form/SearchSelect";

import moment from "moment";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

import Appoint from "model/Appoint/";
import Product from "model/Product/";
import Customer from "model/Customer/";

import EnumProduct from "enum/enumProduct";

const FormItem = Form.Item;
const Option = Select.Option;

const { EnumProductIssuedStatus } = EnumProduct;

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
    this.product = new Product();
    this.customer = new Customer();

    let { data = {}, initFields } = this.props;
  }
  /**
   * 加载已确认的预约数据
   *
   * @memberof EditDeclarationForm
   */
  loadAppoint = productId => {
    return this.appoint.get_my_select(productId).then(res => {
      if (res.success) {
        this.setState({
          my_appoint: res.result || [],

          current_appoint: res.result && res.result.length ? res.result[0] : {}
        });

        if (!res.result || !res.result.length) {
          this.setState({
            declarationModel: 6
          });
        }

        if (res.result && res.result.length) {
          this.formUtils.setFieldsValue({
            dealAmount: res.result[0].reservationAmount
          });
        }
      }
      return res;
    });
  };
  changeAppoint = value => {
    const list = this.state.my_appoint;
    list.map(item => {
      if (item.id == value) {
        this.formUtils.setFieldsValue({
          dealAmount: item.reservationAmount
        });
        this.setState({
          current_appoint: item
        });

        return;
      }
    });
  };
  product_list = [];
  changeProduct = value => {
    const product = this.product_list[value.key];

    let declarationModel = null; // [1:预售中,2:未上线，上线准备中，预售募集中之外的状态可以补单的提示,3:直接报单,4:选择预约报单,5:补录报单的样式,6:选预约报单但是无预约]
    if (product) {
      if (
        [EnumProductIssuedStatus.enum.PRESALE].indexOf(product.issuedStatus) >
        -1
      ) {
        declarationModel = 1;
      } else if (
        [
          EnumProductIssuedStatus.enum.RAISED,
          EnumProductIssuedStatus.enum.SEAL,
          EnumProductIssuedStatus.enum.EXIT
        ].indexOf(product.issuedStatus) > -1
      ) {
        declarationModel = 2;
      } else {
        if (product.declarationModel == 1) {
          //可直接报单
          declarationModel = 3;
        } else {
          //要选择预约才可以报单

          this.loadAppoint(product.id).then(res => {
            if (!res.result || !res.result.length) {
              declarationModel = 6;
            } else {
              declarationModel = 4;
            }
            this.setState({
              declarationModel
            });
            this.formUtils.setFieldsValue({
              declarationModel: declarationModel
            });
            this.props.callback && this.props.callback();
          });
        }
      }
    }
    this.setState({
      current_product: product,
      declarationModel
    });
    this.formUtils.setFieldsValue({ declarationModel: declarationModel });
    this.props.callback && this.props.callback();
  };
  render() {
    const { data, initFields } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    const { current_product, declarationModel, my_appoint } = this.state;

    return (
      <Form
        className={`float-slide-form vant-spin follow-form`}
        ref={ref => (this.container = ReactDom.findDOMNode(ref))}
      >
        <FormItem label="产品名称" {...formItemLayout}>
          <div id={"productId_FormItem"}>
            <SearchSelect
              placeholder="请输入并选择产品"
              request={this.product.get_declaration_product}
              format={r => {
                r.value = r.id;
                r.label = r.name;
                this.product_list[r.id] = r;
                return r;
              }}
              callback={this.changeProduct}
              formUtils={this.props.formUtils}
              name="productId"
              popupContainer={document.body}
              initData={{
                label: data.productName,
                value: data.productId
              }}
            />
            {this.formUtils.getFieldDecorator("productId", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [{ required: true, message: "请输入并选择产品" }]
            })(<Input type="hidden" />)}
          </div>
        </FormItem>
        <div
          style={{
            marginBottom: 10,
            lineHeight: 1.5
          }}
        >
          {declarationModel == 3 ? <p>该产品可直接报单，请填写报单信息:</p> : null}
          {declarationModel == 4 ? <p>该产品需要先预约后报单，请选择审批通过的预约转报单:</p> : null}
          {declarationModel == 6 ? (
            <div
              style={{
                lineHeight: 2
              }}
            >
              <p>该产品募集中，但需预约通过后再转报单，请先预约</p>
              <p>您可以先预约，等待审批通过后转报单</p>
            </div>
          ) : null}
          {declarationModel == 1 ? <p>该产品为预售状态，请先预约</p> : null}
          {declarationModel == 2 ? (
            <div>
              <p style={{ marginBottom: "28px" }}>
                该产品为{
                  EnumProductIssuedStatus.keyValue[current_product.issuedStatus]
                }状态，已停止报单，请和产品经理确认
              </p>
              <p style={{ textAlign: "right" }}>
                如需补录报单,<a
                  onClick={() => {
                    this.setState({
                      declarationModel: 5
                    });
                    this.formUtils.setFieldsValue({ declarationModel: 5 });
                    this.props.callback && this.props.callback();
                  }}
                >
                  请点击这里>>
                </a>
              </p>
            </div>
          ) : null}
        </div>
        {this.formUtils.getFieldDecorator("declarationModel", {})(
          <Input type="hidden" />
        )}

        {declarationModel > 2 ? (
          declarationModel == 6 ? null : (
            <div>
              {declarationModel == 4 ? (
                <FormItem label="选择预约" required={true} {...formItemLayout}>
                  {initFields && initFields.indexOf("productName") > -1
                    ? `${data.reservationAmount}万 ${moment(
                        data.estimatePayDate
                      ).format("YYYY-MM-DD")}`
                    : this.formUtils.getFieldDecorator("reservationId", {
                        validateTrigger: ["onChange", "onBlur"],
                        initialValue: my_appoint.length
                          ? my_appoint[0].id.toString()
                          : null,
                        rules: [
                          {
                            required: true,
                            message: "请选择预约"
                          }
                        ]
                      })(
                        <Select
                          placeholder="请选择"
                          onChange={this.changeAppoint}
                          getPopupContainer={() => this.container}
                        >
                          {my_appoint.map(appoint => {
                            return (
                              <Option key={1} value={appoint.id.toString()}>
                                {`预约：${appoint.customerName} ${appoint.reservationAmount}万 ${moment(
                                  appoint.reservationDate
                                ).format("YYYY-MM-DD")}
                          ${appoint.statusText}`}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                </FormItem>
              ) : null}
              {/* {data.productId ||this.state.current_appoint?this.formUtils.getFieldDecorator("productId", {
          initialValue: data.productId || this.state.current_appoint.productId,
          validateTrigger: ["onChange", "onBlur"],
          rules: [{ required: true, message: "请输入并选择产品" }]
        })(<Input type="hidden" />):null} */}

              <FormItem label="客户名称" {...formItemLayout}>
                <div id={"customerId_FormItem"}>
                  {declarationModel == 4 ? (
                    <div>
                      {this.state.current_appoint.customerName || "请选择预约"}
                    </div>
                  ) : (
                    <SearchSelect
                      placeholder="请输入并选择客户"
                      request={this.customer.get_selection}
                      format={r => {
                        return { value: r.id, label: `${r.name}(${r.mobile})` };
                      }}
                      formUtils={this.props.formUtils}
                      name="customerId"
                    />
                  )}
                  {declarationModel != 4
                    ? this.formUtils.getFieldDecorator("customerId", {
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [{ required: true, message: "请输入并选择客户" }]
                      })(<Input type="hidden" />)
                    : null}
                </div>
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
                  initialValue: data.reservationAmount,
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
            </div>
          )
        ) : null}
      </Form>
    );
  }
}
EditDeclarationForm = Form.create()(EditDeclarationForm);

export default EditDeclarationForm;
