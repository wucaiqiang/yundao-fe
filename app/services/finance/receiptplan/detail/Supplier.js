import React, { Component } from "react";
import {
  Button,
  Icon,
  DatePicker,
  Form,
  Radio,
  Select,
  Input,
  Row,
  Col,
  Affix,
  message
} from "antd";

const FormItem = Form.Item;

const Option = Select.Option;
const RadioGroup = Radio.Group;

import FormUtils from "lib/formUtils";
import GM from "lib/gridManager";

import Base from "components/main/Base";

import Receipt from "model/Finance/receipt";

import style from "./Index.scss";

const GridManager = GM.GridManager;

export default class DetailSupplier extends Base {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  componentWillMount() {
    this.receipt = new Receipt();

    let { data } = this.props;

    this.getData(data.id);
  }
  getColumns() {
    const { data } = this.props;
    const centerTitle = (
      <div>
        <Row>
          <Col span="6">销售金额</Col>
          <Col span="6">佣金类型</Col>
          <Col span="6">前端佣金</Col>
          <Col span="6">后端佣金</Col>
        </Row>
      </div>
    );
    const centerReader = (text, record, index) => {
      const childs = record.productQuotationDtos;
      return (
        childs &&
        childs.map((child, index) => {
          return (
            <Row
              style={{
                height: "40px",
                lineHeight: "40px"
              }}
              key={index}
            >
              <Col span="6">
                {child.saleMax
                  ? `${child.saleMin}-${child.saleMax}万`
                  : `${child.saleMin}万以上`}
              </Col>
              <Col span="6">
                {child.commissionType == "dic_quo_commission_type_front_bk"
                  ? "前端+后端佣金"
                  : "前端佣金"}
              </Col>
              <Col span="6">{child.frontCommission}%</Col>
              <Col span="6">{child.backCommission}%</Col>
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
        render: (text, record, index) => {
          return record.supplierName;
        }
      },
      {
        title: centerTitle,
        dataIndex: "childs",
        width: 600,
        render: centerReader
      },
      {
        title: "报价备注",
        className: "remark",
        dataIndex: "remark",
        render: (text, record, index) => {
          return record.remark;
        }
      }
    ];

    return columns;
  }

  getData(id) {
    this.receipt.getSupplier(id).then(res => {
      if (res.success && res.result) {
        this.setState({ data: [res.result] });
      }
    });
  }
  render() {
    return (
      <GridManager
        noRowSelection={true}
        autoWidth={false}
        disabledAutoLoad={true}
        columns={this.getColumns()}
        dataSource={this.state.data}
        gridWrapClassName={`grid-panel auto-width-grid`}
        className={`multipleForm-table`}
        mod={this}
        rowKey={"key"}
        onSelect={selectData => {
          this.handleSelect(selectData);
        }}
        pagination={false}
        ref={gridManager => {
          gridManager && (this.gridManager = gridManager);
        }}
      />
    );
  }
}
