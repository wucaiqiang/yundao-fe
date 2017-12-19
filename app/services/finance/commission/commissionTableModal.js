import React from "react";
import { Button, Row, Col, Modal, Icon, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import style from "./commissionTableModal.scss";

const icon_add = "/assets/images/icon/新增";
const icon_question = "/assets/images/icon/问号";

import GridBase from "base/gridMod";

import GM from "lib/gridManager.js";
const GridManager = GM.GridManager;

import SettleCommissionModal from "./settleCommissionModal";

class CommissionInfo extends GridBase {
  constructor(props) {
    super(props);
  }
  getColumns(type, key) {
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
      const childs = record.productCommissionDtos;
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
                {child.commissionType == "dic_commission_type_front_back"
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
        title: "佣金规则",
        dataIndex: "ruleName",
        className: "name",
        width: 120,
        render: (text, record, index) => {
          return `${record.ruleName}类`;
        }
      },
      {
        title: centerTitle,
        dataIndex: "childs",
        width: 550,
        render: centerReader
      },
      {
        title: "报价备注",
        dataIndex: "remark",
        className: "remark",
        render: (text, record, index) => {
          return record.remark || "--";
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

export default class CommissionRecordModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      submitting: false,
      data: {},
      filters: {},
      action: null
    };
  }

  show(data = {}) {
    this.setState({ data: data, visible: true });
  }
  handleClose = () => {
    this.setState({ visible: false });
  };

  renderFooter() {
    const btns = [
      <Button key="cancel" onClick={this.handleClose}>
        关闭
      </Button>
    ];
    return btns;
  }
  render() {
    let { data, visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"产品佣金信息"}
        width={680}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooter()}
      >
        <CommissionInfo data={data} />
      </Modal>
    );
  }
}
