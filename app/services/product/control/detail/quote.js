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
  Icon,
  Affix,
  message
} from "antd";

const { Header, Content, Footer, Sider } = Layout;

const InputGroup = Input.Group;

const FormItem = Form.Item;

// const {Option} = Select
const Option = Select.Option;

import GM from "lib/gridManager.js";

import GridBase from "base/gridMod";
const GridManager = GM.GridManager;

import style from "./productDetailInfo.scss";

import Base from "components/main/Base";

import QuoteForm from "./quoteForm";

import FormUtils from "lib/formUtils";

import Product from "model/Product/";

let uuid = 0;


class QuoteInfoForm extends Base {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils;
    this.formUtils.setForm(this.props.form);
  }
  render() {
    const { data, formUtils } = this.props;
    return (
      <Form>
        <QuoteForm data={data} formUtils={formUtils} />
      </Form>
    );
  }
}

QuoteInfoForm = Form.create()(QuoteInfoForm);

class QuoteInfo extends GridBase {
  constructor(props) {
    super(props);
  }
  getColumns(type, key) {
    const { data } = this.props;
    const centerTitle = (
      <div>
        <Row>
          <Col span="6">销售金额(万)</Col>
          <Col span="6">佣金类型</Col>
          <Col span="6">前端佣金(%)</Col>
          <Col span="6">后端佣金(%)</Col>
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
                {child.saleMin}-{child.saleMax}
              </Col>
              <Col span="6">
                {child.commissionType == "dic_quo_commission_type_front_bk"
                  ? "前端+后端佣金"
                  : "前端佣金"}
              </Col>
              <Col span="6">{child.frontCommission}</Col>
              <Col span="6">{child.backCommission}</Col>
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
          return record.supplierName || "--";
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
  render() {
    return (
      <div>
        <GridManager
          noRowSelection={true}
          autoWidth={false}
          disabledAutoLoad={true}
          columns={this.getColumns()}
          dataSource={this.props.data}
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
      </div>
    );
  }
}

class Quote extends Base {
  state = {
    isEdit: false
  };
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.formUtils = new FormUtils("ProductQuoteForm");
    this.product = new Product();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
      //加载不同的资料 设置为非编辑状态
      this.setState({
        isEdit: false
      });
    }
  }

  submit = () => {
    const { data, mod } = this.props;
    let values = {};
    this.formUtils.validateFields((errors, value) => {
      console.log("errors", errors);
      if (!errors) {
        values = this.formUtils.getFieldsValue();
        //处理报价
        console.log("values", values);
        const supplierDtos = [];
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
              if (
                name == "supplierName" ||
                name == "remark" ||
                name == "supplierId"
              ) {
                supplierDtos[index][name] = value;
              }
              if (
                name == "ruleName" ||
                name == "frontCommission" ||
                name == "id" ||
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
                    // if (key == `Quote-sale-${index}-${innerIndex}-number-1`) {
                    supplierDtos[index]["productQuotationDtos"][innerIndex][
                      "saleMin"
                    ] = value.split(",")[0];
                    // } if (key == `Quote-sale-${index}-${innerIndex}-number-2`) {
                    supplierDtos[index]["productQuotationDtos"][innerIndex][
                      "saleMax"
                    ] = value.split(",")[1];
                    // supplierDtos[index]['productQuotationDtos'][innerIndex]['saleMax'] = value }
                  } else {
                    supplierDtos[index]["productQuotationDtos"][innerIndex][
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
              item.id = item.supplierId;
              delete item.supplierId;
              return item;
            })
          );
        }
        values.productId = data.id;
        this.product.update_quotation(values).then(res => {
          if (res.success) {
            message.success("更新产品供应商报价成功");
            // mod.reloading()
            mod.loadData();
            this.setState({
              isEdit: false
            });
          }
        });
      }
    });
  };
  genneratorFix = children => {
    const { mod } = this.props;
    return mod.state.visible ? (
      <Affix target={() => mod.affixContainer}>{children}</Affix>
    ) : (
      children
    );
  };
  render() {
    const { data, mod } = this.props;
    const icons = [];
    const canEdit =
      data.supplierDto.permission.editPermission && data.examineStatus != 1;
    const canRead = data.supplierDto.permission.readPermission;
    if (this.state.isEdit) {
      icons.push(
        <img
          className="anticon"
          index={0}
          src="/assets/images/icon/取消@1x.png"
          srcSet="/assets/images/icon/取消@2x.png"
          onClick={e => {
            this.setState({ isEdit: false });
          }}
        />
      );
      icons.push(
        <img
          className="anticon"
          index={1}
          src="/assets/images/icon/确认@1x.png"
          srcSet="/assets/images/icon/确认@2x.png"
          onClick={this.submit}
        />
      );
    } else {
      if (canRead && canEdit) {
        icons.push(
          <img
            className="anticon anticon-edit"
            index={2}
            src="/assets/images/icon/编辑@1x.png"
            srcSet="/assets/images/icon/编辑@2x.png"
            onClick={e => {
              this.setState({ isEdit: true });
            }}
          />
        );
      }
    }

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>供应商报价</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
          <div className={style.quote}>
            {!canRead ? (
              "无权限查看"
            ) : this.state.isEdit ? (
              <QuoteInfoForm
                formUtils={this.formUtils}
                data={JSON.parse(JSON.stringify(data))}
              />
            ) : (
              <QuoteInfo
                data={JSON.parse(JSON.stringify(data.supplierDto.data))}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Quote;
