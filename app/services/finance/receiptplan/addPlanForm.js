import React from "react";
import ReactDom from "react-dom";
import { Select, Input, Form, InputNumber, AutoComplete } from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Receipt from "model/Finance/receipt";

import style from "./addPlanModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

class AddPlanForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      autoCompleteResult: [],
      supplierName: null
    };

    this.formUtils = new FormUtils("addPlanForm");
  }
  componentWillMount() {
    this.receipt = new Receipt();
    this.getProduct();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  clearSupplier = () => {
    this.setState({ supplierName: null });
  };

  /**
   * 检查回款计划名是否已存在
   *
   * @memberof AddPlanForm
   */
  checkExist = (rule, value, callback) => {
    if (!value) {
      callback();
    } else {
      this.receipt.checkExist({ name: value }).then(res => {
        res.result ? callback("回款计划名称已存在") : callback();
      });
    }
  };
  getProduct = name => {
    this.receipt.searchProduct({ name }).then(res => {
      if (res.success) {
        this.setState({ autoCompleteResult: res.result });
      }
    });
  };
  handleSearch = value => {
    this.setState({ supplierName: null });

    //搜索变化时重新赋值
    this.formUtils.resetFields(["productId", "supplierId"]);
    this.getProduct(value);
  };
  handleSearchSelect(value, option) {
    let { data } = option.props;
    let supplierName = data.supplierName || "暂无供应商";

    this.setState({ supplierName });

    this.formUtils.setFieldsValue({
      productId: value,
      supplierId: data.supplierId || ""
    });
  }
  renderProductOptions = autoCompleteResult => {
    return autoCompleteResult.map(item => {
      return (
        <AutoCompleteOption key={item.id} title={item.name} data={item}>
          {item.name}
        </AutoCompleteOption>
      );
    });
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    const { autoCompleteResult, supplierName } = this.state;

    return (
      <Form ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("productId", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="回款计划名称" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("name", {
            initialValue: null,
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                type: "string",
                whitespace: true,
                message: "请填写长度不超过30个字符",
                min: 1,
                max: 30
              },
              {
                validator: this.checkExist
              }
            ]
          })(<Input placeholder="请输入回款计划名称" />)}
        </FormItem>
        <FormItem label="回款产品" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("productName", {
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                type: "string",
                whitespace: true,
                message: "请输入并选择产品"
              }
            ]
          })(
            <AutoComplete
              placeholder="请输入并选择产品"
              dataSource={this.renderProductOptions(autoCompleteResult)}
              onSearch={this.handleSearch}
              onSelect={(value, option) =>
                this.handleSearchSelect(value, option)}
            >
              <Input />
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="供应商" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("supplierId")(
            <Input type="hidden" />
          )}
          {supplierName}
        </FormItem>
        <FormItem label="计划回款金额" {...formItemLayout}>
          {this.formUtils.getFieldDecorator("amount", {
            initialValue: null,
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                message: "请输入计划回款金额"
              },
              {
                pattern: new RegExp("^\\d+(\\.[1-9]{1,2})?$"),
                message: "必须大于0,最多两位小数"
              }
            ]
          })(<InputNumber min={0} />)}元
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

AddPlanForm = Form.create()(AddPlanForm);

export default AddPlanForm;
