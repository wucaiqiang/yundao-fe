import React, { Component } from "react";

import moment from "moment";

import { Form, Row, Col, message } from "antd";

import extend from "extend";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import User from "model/User/";

import DynamicFormItem from "components/Form/DynamicFormItem";

class BaseInfoForm extends Base {
  state = {
    category: [],
    fields: []
  };
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
    } else if (field.name == "receiverId") {
      //负责人
      field.typeCode = "search_select";
      field.request = this.user.get_users_by_realName;
      field.format = r => {
        return { value: r.id, label: `${r.realName}(${r.mobile})` };
      };
    } else if (field.name == "productScale") {
      field.isMandatory = 1;
    }
    if (field.typeCode == "date") {
    }
    return field;
  };

  renderList() {
    const { data } = this.props;
    if (!data) {
      return null;
    }
    const fields = data.fundDto.data.fundRaiseFieldDtos.map(
      this.formatFieldType
    );

    const { formLayout } = this.state;
    const formItemLayout =
      formLayout === "horizontal"
        ? {
            labelCol: {
              span: 4
            },
            wrapperCol: {
              span: 14
            }
          }
        : null;

    let initIsScale = 0,
      index = 0;

    while (index < fields.length) {
      var field = fields[index];
      if (field.name == "isScale") {
        initIsScale = field.fieldConfigDto && field.fieldConfigDto.initValue;
        break;
      }
      index++;
    }

    const renderFormItem = (field, index) => {
      const isScale =
        this.formUtils.getFieldValue("isScale") != undefined
          ? this.formUtils.getFieldValue("isScale")
          : initIsScale;

      return field.name == "productScale" && isScale == 0 ? null : (
        <DynamicFormItem
          key={index}
          field={field}
          formUtils={this.formUtils}
          {...formItemLayout}
        />
      );
    };

    let leftCol = [],
      rightCol = [];
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
        <Col span={12} style={{ paddingRight: 20 }}>
          {leftCol}
        </Col>
        <Col span={12}>{rightCol}</Col>
      </Row>
    );
  }
  render() {
    const { formLayout } = this.state;
    const formItemLayout =
      formLayout === "horizontal"
        ? {
            labelCol: {
              span: 4
            },
            wrapperCol: {
              span: 14
            }
          }
        : null;
    return <Form>{this.renderList()}</Form>;
  }
}

BaseInfoForm = Form.create()(BaseInfoForm);

class ProductBaseInfoForm extends Base {
  state = {
    loading: true,
    visible: false
  };

  submit(callback) {
    let values = false;
    this.formUtils.validateFields(errors => {
      console.log(errors);
      if (!errors) {
        values = extend(true, {}, this.formUtils.getFieldsValue());

        values = this.formatData(values);
      }
      callback(values);
    });
  }
  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD");
        }
        if (v instanceof Array) {
          if (v[0] && v[0] instanceof Object && v[0]._isAMomentObject) {
            v[0] = v[0].format("YYYY-MM-DD");
          }
          if (v[1] && v[1] instanceof Object && v[1]._isAMomentObject) {
            v[1] = v[1].format("YYYY-MM-DD");
          }

          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        if (`${key}-number-1` || `${key}-number-2`) {
          delete values[`${key}-number-1`];
          delete values[`${key}-number-2`];
        }
        values[key] = v;
      }
    }

    return values;
  }
  constructor(props) {
    super(props);
    this.formUtils = new FormUtils("ProductBaseInfoForm");
  }
  render() {
    const { data } = this.props;
    return <BaseInfoForm formUtils={this.formUtils} data={data} />;
  }
}

export default ProductBaseInfoForm;
