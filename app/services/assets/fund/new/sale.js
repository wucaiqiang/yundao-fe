import React, { Component } from "react";
import { Form, Input, Row, Col } from "antd";
import extend from "extend";

import Base from "components/main/Base";
import DynamicFormItem from "components/Form/DynamicFormItem";

import FormUtils from "lib/formUtils";

import Product from "model/Product/";
import User from "model/User/";

import style from "./sale.scss";

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
        this.props.fields.fundRaiseFieldDtos &&
        this.props.fields.fundRaiseFieldDtos.map(this.formatFieldType)) ||
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
      <Form className={style.saleForm} layout={"vertical"}>
        {this.renderDynamicFormItemList()}
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
        values = extend(true, {}, this.formUtils.getFieldsValue());

        //处理报价
        const supplierDtos = [],
          commissionDtos = [];
        for (var key in values) {
          if (values.hasOwnProperty(key)) {
            var value = values[key];
            if (key.indexOf("Quote-") == 0) {
              //处理报价
              const index = key.split("-")[2];
              const childIndex = key.split("-")[3];
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
                  const innerIndex = childIndex.split("_")[1];
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
                  const innerIndex = childIndex.split("_")[1];
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
            supplierDtos.filter(item => item != null).map(item => {
              item.productQuotationDtos = item.productQuotationDtos.filter(
                item => item != null
              );
              return item;
            })
          );
        }
        if (commissionDtos.length) {
          values["commissionDtos"] = JSON.stringify(
            commissionDtos.filter(item => item != null).map(item => {
              item.productCommissionDtos = item.productCommissionDtos.filter(
                item => item != null
              );
              return item;
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
