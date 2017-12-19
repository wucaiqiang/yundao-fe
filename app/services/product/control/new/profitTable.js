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

import GM from "lib/gridManager.js";
const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const GridSortFilter = GM.GridSortFilter;
const FilterBar = GM.FilterBar;

import style from "./profit.scss";

import multipleFormTable from "components/table/multipleForm";

import QuestionPopover from "components/questionPopover";

const NAME = "Profit";

const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
];

class Profit extends multipleFormTable {
  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {
    title: "收益模式",
    canExpand: true,
    maxColChild: 20,
    maxCol: 1
  };

  static get NAME() {
    return NAME;
  }

  constructor(props) {
    super(props);
  }
  getColumns(type, key) {
    const { data } = this.props;
    const centerTitle = (
      <div>
        <Row>
          <Col span="7">
            认购金额(万)<QuestionPopover text="金额范围第二项不填代表无穷大" />
          </Col>
          <Col span="3" style={{ paddingRight: 10 }}>
            认购期限(月)
          </Col>
          <Col span="5">收益类型</Col>
          <Col span="4">固定收益率(%)</Col>
          <Col span="4">浮动收益率(%)</Col>
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
          let max = data.productScale || null;

          if (record.childs.length > 1) {
            //大于一条的时候 销售金额的起始值必填
            startRequired = true;
          }

          if (index !== record.childs.length - 1) {
            endRequired = true;
          }

          if (index == 0) {
            //大于购买起点
            min = data.buyStartPoint;
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
              <Col span="7">
                <NumberRange
                  errortemp={errortemp}
                  formUtils={this.formUtils}
                  name={`${NAME}-buy-${record.key}-${child.key}`}
                  startRequired={startRequired}
                  endRequired={endRequired}
                  min={min}
                  max={max}
                />
              </Col>
              <Col span="3" style={{ paddingRight: 10 }}>
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-buyTimeLimit-${record.key}-${child.key}`,
                    {
                      initialValue: null,
                      validateTrigger: ["onBlur"],
                      rules: [
                        {
                          required: true,
                          message: "请填写认购期限"
                        }
                      ]
                    }
                  )(<InputNumber precision={0} min={0} />)}
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-incomeType-${record.key}-${child.key}`,
                    {
                      initialValue: "dic_income_type_fix_float",
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
              <Col span="4">
                {this.formUtils.getFieldValue(
                  `${NAME}-incomeType-${record.key}-${child.key}`
                ) == "dic_income_type_float" ? null : (
                  <FormItem>
                    {this.formUtils.getFieldDecorator(
                      `${NAME}-fixIncomeRate-${record.key}-${child.key}`,
                      {
                        initialValue: "",
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
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
              <Col span="4">
                {this.formUtils.getFieldValue(
                  `${NAME}-incomeType-${record.key}-${child.key}`
                ) == "dic_income_type_fix" ? null : (
                  <FormItem>
                    {this.formUtils.getFieldDecorator(
                      `${NAME}-floatIncomeRate-${record.key}-${child.key}`,
                      {
                        initialValue: "",
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
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
        width: 800,
        className: "multipleFormTable_child",
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
              <FormItem>
                {this.formUtils.getFieldDecorator(
                  `${NAME}-remark-${record.key}`,
                  {
                    initialValue: "",
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

export default Profit;
