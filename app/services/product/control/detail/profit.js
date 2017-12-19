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

import ProfitForm from "./profitForm";

import FormUtils from "lib/formUtils";

import Product from "model/Product/";

let uuid = 0;


class ProfitInfoForm extends Base {
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
        <ProfitForm data={data} formUtils={formUtils} />
      </Form>
    );
  }
}

ProfitInfoForm = Form.create()(ProfitInfoForm);

class ProfitInfo extends GridBase {
  constructor(props) {
    super(props);
  }
  getColumns(type, key) {
    const { data } = this.props;
    const centerTitle = (
      <div>
        <Row>
          <Col span="7">认购金额(万)</Col>
          <Col span="3">认购期限(月)</Col>
          <Col span="4">收益类型</Col>
          <Col span="5">固定收益率(%)</Col>
          <Col span="5">浮动收益率(%)</Col>
        </Row>
      </div>
    );
    const centerReader = (text, record, index) => {
      const childs = record.productIncomeDtos;
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
              <Col span="7">
                {child.buyMin}-{child.buyMax}
              </Col>
              <Col span="3">{child.buyTimeLimit}</Col>
              <Col span="4">
                {child.incomeType == "dic_income_type_fix"
                  ? "固定收益"
                  : child.incomeType == "dic_income_type_float"
                    ? "浮动收益"
                    : "固定+浮动收益"}
              </Col>
              <Col span="5">{child.fixIncomeRate}</Col>
              <Col span="5">{child.floatIncomeRate}</Col>
            </Row>
          );
        })
      );
    };
    const columns = [
      // {
      //     title: "规则",
      //     dataIndex: "ruleName",
      //     className: "name",
      //     width: 200,
      //     render: (text, record, index) => {
      //         return record.ruleName || '--'
      //     }
      // },
      {
        title: centerTitle,
        dataIndex: "childs",
        width: 800,
        render: centerReader
      },
      {
        title: "报价备注",
        dataIndex: "remark",
        className: "remark",
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

class Profit extends Base {
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
    let values = false;
    this.formUtils.validateFields((errors, value) => {
      if (!errors) {
        values = this.formUtils.getFieldsValue();
        const incomeDtos = [];
        for (var key in values) {
          if (values.hasOwnProperty(key)) {
            var value = values[key];
            if (key.indexOf("Profit") > -1) {
              //处理收益模式
              const index = key.split("-")[2];
              const childIndex = key.split("-")[3];
              const name = key.split("-")[1];
              if (!incomeDtos[index]) {
                incomeDtos[index] = {};
              }
              if (
                name == "ruleName" ||
                name == "remark" ||
                name == "profitId"
              ) {
                incomeDtos[index][name] = value;
              }
              if (
                name == "buy" ||
                name == "buyTimeLimit" ||
                name == "incomeType" ||
                name == "id" ||
                name == "fixIncomeRate" ||
                name == "floatIncomeRate"
              ) {
                //处理单条报价
                if (!incomeDtos[index]["productIncomeDtos"]) {
                  incomeDtos[index]["productIncomeDtos"] = [];
                }
                if (childIndex) {
                  const innerIndex = childIndex.split("_")[1];
                  if (!incomeDtos[index]["productIncomeDtos"][innerIndex]) {
                    incomeDtos[index]["productIncomeDtos"][innerIndex] = {};
                  }
                  if (name == "buy" && value) {
                    incomeDtos[index]["productIncomeDtos"][innerIndex][
                      "buyMin"
                    ] = value.split(",")[0];
                    incomeDtos[index]["productIncomeDtos"][innerIndex][
                      "buyMax"
                    ] = value.split(",")[1];
                    // }
                  } else {
                    incomeDtos[index]["productIncomeDtos"][innerIndex][
                      name
                    ] = value;
                  }
                }
              }
              delete values[key];
            }
          }
        }
        if (incomeDtos.length) {
          data.incomeDtos = incomeDtos;
          //更新根组件state 数据
          mod.updateData && mod.updateData(data);

          values["incomeDtos"] = JSON.stringify(
            incomeDtos.filter(item => item != null).map(item => {
              item.productIncomeDtos = item.productIncomeDtos.filter(
                item => item != null
              );
              item.id = item.profitId;
              delete item.profitId;
              return item;
            })
          );
        }
        values.productId = data.id;
        this.product.update_income(values).then(res => {
          if (res.success) {
            message.success("更新产品收益模式成功");
            // mod.reloading()
            mod.loadData();
            this.setState({
              isEdit: false
            });
          }
        });
      }
    });
    // return values
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
    const canEdit =
      data.productDto.permission.editPermission && data.examineStatus != 1;
    const canRead = data.productDto.permission.readPermission;
    const icons = [];
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
            <div className={style.title}>收益模式</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
          <div className={style.profit}>
            {this.state.isEdit ? (
              <ProfitInfoForm
                formUtils={this.formUtils}
                data={JSON.parse(JSON.stringify(data))}
              />
            ) : (
              <ProfitInfo data={JSON.parse(JSON.stringify(data.incomeDtos))} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Profit;
