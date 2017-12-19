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


const NAME = "Quote";

class QuoteForm extends multipleFormTable {
  static propTypes = {
    title: PropTypes.string
  };

  static defaultProps = {
    title: "供应商报价",
    showTitle: false,
    canExpand: true,
    maxColChild: 20,
    maxCol: 1
  };

  static get NAME() {
    return NAME;
  }

  state = {
    data: []
  };

  componentWillMount() {
    // console.log(this.props.data)
    this.formUtils = this.props.formUtils || this.formUtils;
    const { data } = this.props;
    if (data && data.supplierDto.data) {
      data.supplierDto.data.map((item, index) => {
        item.key = index;
        if (item.productQuotationDtos) {
          item.childs = item.productQuotationDtos.map((quo, childIndex) => {
            quo.key = index + "_" + childIndex;
            return quo;
          });
        }

        return item;
      });
    }
    this.setState({
      data: data.supplierDto.data || []
    });
  }

  getColumns(type, key) {
    const { data } = this.props;
    let productScale, buyStartPoint;
    data.productDto.data.productSaleFieldDtos &&
      data.productDto.data.productSaleFieldDtos.map(item => {
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
          <Col span="6">
            销售金额(万)<QuestionPopover text="金额范围第二项不填代表无穷大" />
          </Col>
          <Col span="6">佣金类型</Col>
          <Col span="6">前端佣金(%)</Col>
          <Col span="6">后端佣金(%)</Col>
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
      const childs = record.childs;
      return (
        childs &&
        childs.map((child, index) => {
          let min,
            errortemp = `销售金额`,
            endRequired = false,
            startRequired = true;
          //必须小于募集规模
          let max = productScale || null;

          if (childs.length > 1) {
            //大于一条的时候 销售金额的起始值必填
            startRequired = true;
          }

          if (index !== childs.length - 1) {
            endRequired = true;
          }

          if (index == 0) {
            //大于购买起点
            min = buyStartPoint || null;
          } else {
            const prevKey = record.childs[index - 1].key;
            const prevRange = this.formUtils.getFieldValue(
              `${NAME}-sale-${record.key}-${prevKey}`
            );
            // console.log(` prevRange ${NAME}-sale-${record.key}-${index - 1}`, prevRange)
            if (prevRange) {
              min = prevRange.split(",")[1];
            }
          }

          return (
            <Row className={"child"} key={child.key}>
              {this.formUtils.getFieldDecorator(
                `${NAME}-id-${record.key}-${child.key}`,
                { initialValue: child.id }
              )(<Input type="hidden" />)}
              <Col span="6">
                <NumberRange
                  errortemp={errortemp}
                  formUtils={this.formUtils}
                  name={`${NAME}-sale-${record.key}-${child.key}`}
                  startValue={child.saleMin}
                  endValue={child.saleMax}
                  startRequired={startRequired}
                  endRequired={endRequired}
                  min={min}
                  max={max}
                />
              </Col>
              <Col
                span="6"
                id={`${NAME}-commissionType-${record.key}-${child.key}_FormItem`}
              >
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-commissionType-${record.key}-${child.key}`,
                    {
                      initialValue:
                        child.commissionType ||
                        "dic_quo_commission_type_front_bk",
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
                      getPopupContainer={() =>
                        document.getElementById(
                          `${NAME}-commissionType-${record.key}-${child.key}_FormItem`
                        )}
                      style={{
                        width: 120
                      }}
                    >
                      <Option value="dic_quo_commission_type_front">
                        前端佣金
                      </Option>
                      <Option value="dic_quo_commission_type_front_bk">
                        前端+后端佣金
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem>
                  {this.formUtils.getFieldDecorator(
                    `${NAME}-frontCommission-${record.key}-${child.key}`,
                    {
                      initialValue: child.frontCommission,
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
                              callback("请填写前端佣金(%)");
                            }
                          }
                        }
                      ]
                    }
                  )(<InputNumber />)}
                </FormItem>
              </Col>
              <Col span="6">
                {this.formUtils.getFieldValue(
                  `${NAME}-commissionType-${record.key}-${child.key}`
                ) == "dic_quo_commission_type_front" ? null : (
                  <FormItem>
                    {this.formUtils.getFieldDecorator(
                      `${NAME}-backCommission-${record.key}-${child.key}`,
                      {
                        initialValue: child.backCommission,
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
                            type: "string",
                            required: true,
                            whitespace: true,
                            message: "请填写后端佣金(%)",
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
        title: "供应商",
        dataIndex: "supplierName",
        className: "name",
        width: 120,
        render: (text, record, recordIndex) => {
          return (
            <FormItem>
              {this.formUtils.getFieldDecorator(
                `${NAME}-supplierName-${record.key}`,
                {
                  initialValue: record.supplierName,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      validator: (rule, value, callback) => {
                        if (!value) {
                          callback(`请填写供应商名称`);
                        } else {
                          //查找其它的supplierName
                          let values = this.formUtils.getFieldsValue();
                          //处理报价
                          const supplierNameList = [];
                          for (let key in values) {
                            if (values.hasOwnProperty(key)) {
                              let value = values[key];
                              if (key.indexOf("Quote-") == 0) {
                                //处理报价
                                const index = key.split("-")[2];
                                const childIndex = key.split("-")[3];
                                const name = key.split("-")[1];
                                if (
                                  name == "supplierName" &&
                                  index != recordIndex
                                ) {
                                  supplierNameList.push(value);
                                }
                              }
                            }
                          }
                          if (supplierNameList.indexOf(value) > -1) {
                            callback(`供应商名称已经存在`);
                          }
                        }
                        callback();
                      }
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
        width: 600,
        render: centerReader
      },
      {
        title: "报价备注",
        dataIndex: "remark",
        width: 120,
        className: "remark",
        render: (text, record, index) => {
          return (
            <div>
              {this.formUtils.getFieldDecorator(
                `${NAME}-supplierId-${record.key}`,
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

export default QuoteForm;
