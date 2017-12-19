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

import Base from "../../../../components/main/Base";
import FormUtils from "../../../../lib/formUtils";

import NumberRange from "../../../../components/Form/NumberRange";

import GM from "../../../../lib/gridManager.js";
const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const GridSortFilter = GM.GridSortFilter;
const FilterBar = GM.FilterBar;

import multipleFormTable from "../../../../components/table/multipleForm";

import QuestionPopover from 'components/questionPopover'

const NAME = "Commission";

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

class Commission extends multipleFormTable {
  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {
    title: "销售佣金",
    canExpand: true,
    maxColChild: 20,
    maxCol: 20
  };

  static get NAME() {
    return NAME;
  }

  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  getColumns(type, key) {
    const { data } = this.props;
    const centerTitle = (
      <div>
        <Row>
          <Col span="8">销售金额(万)<QuestionPopover text="金额范围第二项不填代表无穷大"/></Col>
          <Col span="6">佣金类型</Col>
          <Col span="5">前端佣金(%)</Col>
          <Col span="5">后端佣金(%)</Col>
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
            errortemp = `销售金额`,
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
              `${NAME}-sale-${record.key}-${prevKey}`
            );
            if (prevRange) {
              min = prevRange.split(",")[1];
            }
          }

          return (
            <Row className="child" key={child.key}>
              <Col span="8">

                <NumberRange
                  errortemp={errortemp}
                  formUtils={this.formUtils}
                  name={`${NAME}-sale-${record.key}-${child.key}`}
                  startRequired={startRequired}
                  endRequired={endRequired}
                  min={min}
                  max={max}
                />
              </Col>
              <Col span="6">
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-commissionType-${record.key}-${child.key}`,
                    {
                      initialValue: "dic_commission_type_front_back",
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          required: true,
                          whitespace: true,
                          message: "请选择佣金类型"
                        }
                      ]
                    }
                  )(
                    <Select
                      style={{
                        width: 120
                      }}
                    >
                      <Option value="dic_commission_type_front">前端佣金</Option>
                      <Option value="dic_commission_type_front_back">
                        前端+后端佣金
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span="5">

                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-frontCommission-${record.key}-${child.key}`,
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
                              callback("请填写前端佣金(%)");
                            }
                          }
                        }
                      ]
                    }
                  )(<InputNumber />)}
                </FormItem>
              </Col>
              <Col span="5">
                {this.formUtils.getFieldValue(
                  `${NAME}-commissionType-${record.key}-${child.key}`
                ) == "dic_commission_type_front" ? null : (
                  <FormItem>
                    {this.formUtils.getFieldDecorator(
                      `${NAME}-backCommission-${record.key}-${child.key}`,
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
                                callback("请填写后端佣金(%)");
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
        title: "佣金规则",
        dataIndex: "ruleName",
        className: "name",
        width: 120,
        render: (text, record, index) => {
          return (
            <FormItem>
              {this.formUtils.getFieldDecorator(
                `${NAME}-ruleName-${record.key}`,
                {
                  initialValue: null,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: "请填写佣金规则"
                    }
                  ]
                }
              )(<Input />)}
            </FormItem>
          );
        }
      },
      {
        title: centerTitle,
        dataIndex: "name_001",
        width: 800,
        className: "multipleFormTable_child",
        render: centerReader
      },
      {
        title: "佣金备注",
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

export default Commission;
