import React, { Component } from "react";

import moment from "moment";

const Moment = moment;

import { Layout, Form, Tabs, Input, Select, Row, Col, Spin } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const FormItem = Form.Item;

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import User from "model/User/";

//数据源
import Product from "model/Product/";

import DynamicFormItem from "components/Form/DynamicFormItem";

import extend from 'extend'

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
    }
    if (field.typeCode == "date") {
    }
    // if (field.typeCode == "date_range") {
    //   if (field.fieldConfigDto && field.fieldConfigDto.initValue) {
    //     let range = field.fieldConfigDto.initValue.split(",");
    //     if (range[0]) {
    //       range[0] = moment(range[0]);
    //     }
    //     if (range[1]) {
    //       range[1] = moment(range[1]);
    //     }
    //     if (range[0] || range[1]) {
    //       field.fieldConfigDto.initValue = range;
    //     } else {
    //       field.fieldConfigDto.initValue = null;
    //     }
    //   }
    // }
    return field;
  };

  renderList() {
    const { data } = this.props;
    if (!data) {
      return null;
    }
    const fields = data.productDto.data.productFieldDtos.map(
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

    const renderFormItem = (field, index) => {
      return (
        <DynamicFormItem
          key={index}
          field={field}
          formUtils={this.formUtils}
          {...formItemLayout}
        />
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
        <Col span={12} style={{paddingRight:20}}>{leftCol}</Col>
        <Col span={12}>{rightCol}</Col>
      </Row>
    );
  }
  render() {
    return <Form>{this.renderList()}</Form>;
  }
}

BaseInfoForm = Form.create()(BaseInfoForm);

class ProductBaseInfoForm extends Base {
  state = {
    loading: true,
    visible: false
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
      //加载不同的资料 设置为非编辑状态
      this.setState({
        isEdit: false
      });
    }
  }

  submit(callback) {
    let values = false;
    this.formUtils.validateFields(errors => {
      console.log(errors);
      if (!errors) {
        values = extend(true,{},this.formUtils.getFieldsValue())

        if (values.saleDate) {
          //处理时间
          values.saleDate = [
            values.saleDate[0].format("YYYY-MM-DD"),
            values.saleDate[1].format("YYYY-MM-DD")
          ].join(",");
        }

        values = this.formatData(values);

        callback(values);
      }
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
          if( v[0] && v[0] instanceof Object &&  v[0]._isAMomentObject){
              v[0]= v[0].format("YYYY-MM-DD")
          }
          if(v[1] && v[1] instanceof Object &&  v[1]._isAMomentObject){
              v[1]= v[1].format("YYYY-MM-DD")
          }

          v = v.join(',')
      }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        if (`${key}-number-1` || `${key}-number-2`) {
          delete values[`${key}-number-1`];
          delete values[`${key}-number-2`];
        }

        //对image类型进行特别处理

        this.props.data.productDto.data.productFieldDtos.map(field => {
          if (field.name == key && field.typeCode == "image") {
            v = values[key].map(item => item.id).join(",");
          }
        });

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
//

export default ProductBaseInfoForm;
