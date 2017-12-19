import React, { Component } from "react";

import {
  Layout,
  Form,
  Tabs,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Radio,
  Row,
  Col
} from "antd";

const { Header, Content, Footer, Sider } = Layout;

const InputGroup = Input.Group;

const RadioGroup = Radio.Group;

const FormItem = Form.Item;

const { TabPane } = Tabs;

const RangePicker = DatePicker.RangePicker;
// const {Option} = Select
const Option = Select.Option;

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";
import Product from "model/Product/";
import User from "model/User/";

import extend from 'extend';

import NumberRange from "components/Form/NumberRange";

import DynamicFormItem from "components/Form/DynamicFormItem";

import style from "./sale.scss";

import Quote from "./quote";
import Commission from "./commission";
class SaleForm extends Base {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    this.user = new User();
  }

  formatFieldType = field => {
    if (field.name == "assistantId") {
      //助理
      field.typeCode = "search_select";
      field.request = this.user.get_users_by_realName;
      field.format = r => {
        return { value: r.id, label: `${r.realName}(${r.mobile})` };
      };
    }
    if (field.name == "receiverId") {
      //负责人
      field.typeCode = "search_select";
      field.request = this.user.get_users_by_realName;
      field.format = r => {
        return { value: r.id, label: `${r.realName}(${r.mobile})` };
      };
    }
    if (field.name == "productScale") {
      field.isMandatory = 1;
    }
    return field;
  };

  renderDynamicFormItemList() {
    const fields =
      (this.props.fields &&
        this.props.fields.productSaleFieldDtos &&
        this.props.fields.productSaleFieldDtos.map(this.formatFieldType)) ||
      [];

    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      }
    };

    const renderFormItem = (field, index) => {
      return field.name == "productScale" &&
      this.formUtils.getFieldValue("isScale") === "0" ? null : (
        <DynamicFormItem key={index} field={field} formUtils={this.formUtils} />
      );
    };
    let leftCol = [],
      rightCol = [],
      index = 0;
    while (index < fields.length) {
      var field = fields[index];
      var nextField = fields[index + 1];

      {
        !field ? null : leftCol.push(renderFormItem(field, index));
      }
      {
        !nextField ? null : rightCol.push(renderFormItem(nextField, index + 1));
      }
      index = index + 2;
    }

    return (
      <Row>
        <Col span={8}>{leftCol}</Col>
        <Col span={2} />
        <Col span={8}>{rightCol}</Col>
      </Row>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <Form className={style.saleForm} layout={"vertical"} >
        {this.renderDynamicFormItemList()}
        <div className={style.quote}>
          <Quote data={data} formUtils={this.formUtils} />
        </div>
        <div className={style.commission}>
          <Commission data={data} formUtils={this.formUtils} />
        </div>
      </Form>
    );
  }
}

SaleForm = Form.create()(SaleForm);

class ProductSale extends Base {
  state = {
    loading: true,
    visible: false
  };
  submit(callback) {
    let values = false;
    this.formUtils.validateFields((errors, value) => {
      console.log(errors, value);
      if (!errors) {
        // values = this.formUtils.getFieldsValue();
        values = extend(true,{},this
          .formUtils
          .getFieldsValue())
        // if (values.saleDate) {
        //   //处理时间
        //   values.saleDate = [
        //     values.saleDate[0].format("YYYY-MM-DD"),
        //     values.saleDate[1].format("YYYY-MM-DD")
        //   ].join(",");
        // }

        //处理报价
        const supplierDtos = [],
          commissionDtos = [];
        for (var key in values) {
          if (values.hasOwnProperty(key)) {
            var value = values[key];
            if (key.indexOf("Quote-") == 0) {
              //处理报价
              const index = key.split("-")[2];
              const childIndex = key.split("-")[3]
              const name = key.split("-")[1];
              if (!supplierDtos[index]) {
                supplierDtos[index] = {};
              }
              if (name == "supplierName" || name == "remark") {
                supplierDtos[index][name] = value;
              }
              if (
                name == "ruleName" ||
                name == "frontCommission" ||
                name == "commissionType" ||
                name == "backCommission" ||
                name == "sale"
              ) {
                //处理单条报价
                if (!supplierDtos[index]["productQuotationDtos"]) {
                  supplierDtos[index]["productQuotationDtos"] = [];
                }
                if (childIndex) {
                  const innerIndex = childIndex.split('_')[1]
                  if (
                    !supplierDtos[index]["productQuotationDtos"][innerIndex]
                  ) {
                    supplierDtos[index]["productQuotationDtos"][
                      innerIndex
                    ] = {};
                  }
                  if (name == "sale" && value) {
                    supplierDtos[index]["productQuotationDtos"][innerIndex][
                      "saleMin"
                    ] = value.split(",")[0];
                    supplierDtos[index]["productQuotationDtos"][innerIndex][
                      "saleMax"
                    ] = value.split(",")[1];
                  } else {
                    supplierDtos[index]["productQuotationDtos"][innerIndex][
                      name
                    ] = value;
                  }
                }
              }
              delete values[key];
            }
            if (key.indexOf("Commission-") == 0) {
              console.log(key);
              console.log(value);
              //处理销售佣金
              const index = key.split("-")[2];
              const childIndex = key.split("-")[3];
              const name = key.split("-")[1];
              if (!commissionDtos[index]) {
                commissionDtos[index] = {};
              }
              if (name == "ruleName" || name == "remark") {
                commissionDtos[index][name] = value;
              }
              if (
                name == "frontCommission" ||
                name == "commissionType" ||
                name == "backCommission" ||
                name == "sale"
              ) {
                //处理单条报价
                if (!commissionDtos[index]["productCommissionDtos"]) {
                  commissionDtos[index]["productCommissionDtos"] = [];
                }
                if (childIndex) {
                  const innerIndex = childIndex.split('_')[1]
                  if (
                    !commissionDtos[index]["productCommissionDtos"][innerIndex]
                  ) {
                    commissionDtos[index]["productCommissionDtos"][
                      innerIndex
                    ] = {};
                  }
                  if (name == "sale" && value) {
                    commissionDtos[index]["productCommissionDtos"][innerIndex][
                      "saleMin"
                    ] = value.split(",")[0];
                    // }
                    commissionDtos[index]["productCommissionDtos"][innerIndex][
                      "saleMax"
                    ] = value.split(",")[1];
                    // }
                  } else {
                    commissionDtos[index]["productCommissionDtos"][innerIndex][
                      name
                    ] = value;
                  }
                }
              }
              delete values[key];
            }
          }
        }

        if (supplierDtos.length) {
          values["supplierDtos"] = JSON.stringify(
            supplierDtos.filter(item => item != null).map(item=>{
              item.productQuotationDtos = item.productQuotationDtos.filter(item=>item!=null)
              return item
            })
          );
        }
        if (commissionDtos.length) {
          values["commissionDtos"] = JSON.stringify(
            commissionDtos.filter(item => item != null).map(item=>{
              item.productCommissionDtos = item.productCommissionDtos.filter(item=>item!=null)
              return item
            })
          );
        }
      }
      callback(values);
    });
  }
  constructor(props) {
    super(props);
    this.formUtils = new FormUtils("ProductInfo");
  }
  componentDidMount() {}
  render() {
    const { data } = this.props;
    return (
      <div className={style.product_detail}>
        <SaleForm
          data={data}
          fields={this.props.fields}
          formUtils={this.formUtils}
        />
      </div>
    );
  }
}

export default ProductSale;
