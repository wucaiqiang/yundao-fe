import React, { Component } from "react";

import { TweenOneGroup } from "rc-tween-one";

import PropTypes from "prop-types";

import {
  Layout,
  Form,
  Tabs,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Button,
  Icon
} from "antd";

const { Header, Content, Footer, Sider } = Layout;

const InputGroup = Input.Group;

const FormItem = Form.Item;

// const {Option} = Select
const Option = Select.Option;

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import NumberRange from "components/Form/NumberRange";

import multipleFormTable from "components/table/multipleForm";

import QuestionPopover from "components/questionPopover";

const NAME = "Profit";


class ProfitForm extends multipleFormTable {
  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {
    title: "收益模式",
    showTitle: false,
    canExpand: true,
    maxColChild: 20,
    maxCol: 1
  };

  static get NAME() {
    return NAME;
  }

  componentWillMount() {
    // console.log(this.props.data)
    this.formUtils = this.props.formUtils || this.formUtils;
    const { data } = this.props;
    if (data && data.incomeDtos) {
      data.incomeDtos.map((item, index) => {
        item.key = index;
        if (item.productIncomeDtos) {
          item.childs = item.productIncomeDtos.map((child, childIndex) => {
            child.key = index + "_" + childIndex;
            return child;
          });
        }

        return item;
      });
    }
    this.setState({
      data: data.incomeDtos || []
    });
  }

  getColumns(type, key) {
    const { data } = this.props;
    let productScale, buyStartPoint;
    data.productSaleFieldDtos &&
      data.productSaleFieldDtos.map(item => {
        if (item.name == "productScale") {
          productScale = item.fieldConfigDto.initValue;
        }
        if (item.name == "buyStartPoint") {
          buyStartPoint = item.fieldConfigDto.initValue;
        }
      });
    const centerTitle = (
      <div>
        <Row>
          <Col span="7">
            认购金额(万)<QuestionPopover text="金额范围第二项不填代表无穷大" />
          </Col>
          <Col span="3">认购期限(月)</Col>
          <Col span="4">收益类型</Col>
          <Col span="5">固定收益率(%)</Col>
          <Col span="5">浮动收益率(%)</Col>
        </Row>
      </div>
    );

    const operationReader = (text, record, index) => {
      const childs = record.childs;
      return (
        childs &&
        childs.map((child, index) => {
          return (
            <div className="ant-row child">
              <div className="action_icons">
                <a
                  icon="delete"
                  onClick={() => {
                    index == 0 && childs.length == 1
                      ? this.removeCol([record.key])
                      : this.removeColChild(child.key);
                  }}
                >
                  删除
                </a>
                {index == childs.length - 1 ? (
                  <a
                    icon="plus"
                    onClick={() => {
                      this.addColChild(record.key);
                    }}
                  >
                    新增一行
                  </a>
                ) : null}
              </div>
            </div>
          );
        })
      );
    };
    const centerReader = (text, record, index) => {
      return (
        record.childs &&
        record.childs.map((child, index) => {
          let min,
            errortemp = `认购金额`,
            endRequired = false,
            startRequired = true;
          //必须小于募集规模
          let max = productScale || null;

          if (record.childs.length > 1) {
            //大于一条的时候 销售金额的起始值必填
            startRequired = true;
          }

          if (index !== record.childs.length - 1) {
            endRequired = true;
          }

          if (index == 0) {
            //大于购买起点
            min = buyStartPoint;
          } else {
            const prevKey = record.childs[index - 1].key;
            const prevRange = this.formUtils.getFieldValue(
              `${NAME}-buy-${record.key}-${prevKey}`
            );
            if (prevRange) {
              min = prevRange.split(",")[1];
            }
          }

          return (
            <Row className="child" key={child.key}>
              {this.formUtils.getFieldDecorator(
                `${NAME}-id-${record.key}-${child.key}`,
                { initialValue: child.id }
              )(<Input type="hidden" />)}
              <Col span="7">
                <NumberRange
                  errortemp={errortemp}
                  formUtils={this.formUtils}
                  name={`${NAME}-buy-${record.key}-${child.key}`}
                  startRequired={startRequired}
                  startValue={child.buyMin}
                  endValue={child.buyMax}
                  endRequired={endRequired}
                  min={min}
                  max={max}
                />
              </Col>
              <Col span="3">
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-buyTimeLimit-${record.key}-${child.key}`,
                    {
                      initialValue: child.buyTimeLimit
                        ? child.buyTimeLimit.toString()
                        : null,
                      validateTrigger: ["onBlur"],
                      rules: [
                        {
                          required: true,
                          whitespace: true,
                          message: "请填写认购期限"
                        }
                      ]
                    }
                  )(<InputNumber precision={0} min={0} />)}
                </FormItem>
              </Col>
              <Col
                span="4"
                id={`${NAME}-incomeType-${record.key}-${child.key}_FormItem`}
              >
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-incomeType-${record.key}-${child.key}`,
                    {
                      initialValue:
                        child.incomeType || "dic_income_type_fix_float",
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          required: true,
                          whitespace: true,
                          message: "请选择收益类型"
                        }
                      ]
                    }
                  )(
                    <Select
                      getPopupContainer={() =>
                        document.getElementById(
                          `${NAME}-incomeType-${record.key}-${
                            child.key
                          }_FormItem`
                        )
                      }
                      style={{
                        width: 120
                      }}
                    >
                      <Option value="dic_income_type_fix">固定收益</Option>
                      <Option value="dic_income_type_float">浮动收益</Option>
                      <Option value="dic_income_type_fix_float">
                        固定+浮动收益
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span="5">
                {this.formUtils.getFieldValue(
                  `${NAME}-incomeType-${record.key}-${child.key}`
                ) == "dic_income_type_float" ? null : (
                  <FormItem>
                    {this.formUtils.getFieldDecorator(
                      `${NAME}-fixIncomeRate-${record.key}-${child.key}`,
                      {
                        initialValue: child.fixIncomeRate,
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
                            type: "string",
                            required: true,
                            whitespace: true,
                            validator: (rule, value, callback) => {
                              if (value) {
                                if (value.toString().split(".").length > 1) {
                                  const len = value.toString().split(".")[1]
                                    .length;
                                  if (len > 4) {
                                    callback("只支持4位以内小数");
                                  } else {
                                    callback();
                                  }
                                } else {
                                  callback();
                                }
                              } else {
                                callback("请填写固定收益率(%)");
                              }
                            }
                          }
                        ]
                      }
                    )(<InputNumber />)}
                  </FormItem>
                )}
              </Col>
              <Col span="5">
                {this.formUtils.getFieldValue(
                  `${NAME}-incomeType-${record.key}-${child.key}`
                ) == "dic_income_type_fix" ? null : (
                  <FormItem>
                    {this.formUtils.getFieldDecorator(
                      `${NAME}-floatIncomeRate-${record.key}-${child.key}`,
                      {
                        initialValue: child.floatIncomeRate,
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
                            type: "string",
                            required: true,
                            whitespace: true,
                            validator: (rule, value, callback) => {
                              if (value) {
                                if (value.toString().split(".").length > 1) {
                                  const len = value.toString().split(".")[1]
                                    .length;
                                  if (len > 4) {
                                    callback("只支持4位以内小数");
                                  } else {
                                    callback();
                                  }
                                } else {
                                  callback();
                                }
                              } else {
                                callback("请填写浮动收益率(%)");
                              }
                            }
                          }
                        ]
                      }
                    )(<InputNumber />)}
                  </FormItem>
                )}
              </Col>
            </Row>
          );
        })
      );
    };

    const columns = [
      {
        title: centerTitle,
        dataIndex: "name_001",
        className: "multipleFormTable_child",
        width: 800,
        render: centerReader
      },
      {
        title: "收益备注",
        dataIndex: "remark",
        width: 120,
        className: "remark",
        render: (text, record, index) => {
          return (
            <div>
              {this.formUtils.getFieldDecorator(
                `${NAME}-profitId-${record.key}`,
                { initialValue: record.id }
              )(<Input type="hidden" />)}
              <FormItem>
                {this.formUtils.getFieldDecorator(
                  `${NAME}-remark-${record.key}`,
                  {
                    initialValue: record.remark,
                    validateTrigger: ["onChange", "onBlur"],
                    rules: [
                      {
                        whitespace: true
                      }
                    ]
                  }
                )(<Input />)}
              </FormItem>
            </div>
          );
        }
      },
      {
        title: "操作",
        dataIndex: "operation",
        className: "operation",
        render: operationReader
      }
    ];

    return columns;
  }
}

export default ProfitForm;
