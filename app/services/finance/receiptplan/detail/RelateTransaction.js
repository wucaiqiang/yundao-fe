import React, { Component } from "react";
import ReactDom from "react-dom";

import { Button, Icon, Modal, message } from "antd";
import moment from "moment";
import ClassNames from "classnames";

import GM from "lib/gridManager";

import Base from "components/main/Base";

import AddTransactionModal from "services/finance/receiptplan/addTransactionModal";

import Receipt from "model/Finance/receipt";

import style from "./Index.scss";

const { GridManager } = GM;

export default class DetailRelateTransaction extends Base {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
  }
  componentWillMount() {
    this.receipt = new Receipt();
  }
  getColumns = () => {
    const columns = [
      {
        title: "报单编号",
        dataIndex: "number",
        width: 100
      },
      {
        title: "客户名称",
        dataIndex: "customerName"
      },
      {
        title: "客户编号",
        dataIndex: "customerNumber"
      },
      {
        title: "认购金额",
        dataIndex: "dealAmount",
        render: (text, record) => {
          return `${text}万`;
        }
      },
      {
        title: "报单确认日期",
        dataIndex: "commitDate",
        render: (text, record) => {
          return moment(text).format("YYYY-MM-DD");
        }
      },
      {
        title: "成单人",
        dataIndex: "dealFpName"
      },
      {
        title: "结佣次数",
        dataIndex: "commissionCount"
      },
      {
        title: "结佣金额",
        dataIndex: "commissionTotalAmount",
        width: 140,
        render: text => {
          return `${text}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }
    ];

    return columns;
  };
  reload = () => {
    this.gridManager.grid.reload();
    this.props.mod.reloading()

  };
  handleSelect(selectData) {
    let { selectIds, selectRowsCount = 0 } = selectData;
    this.setState({ selectIds, selectRowsCount });
  }
  handleRemove = () => {
    this.setState({ visible: true });
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };
  handleSubmit = () => {
    let { selectIds } = this.state;

    this.receipt.delDeclaration(selectIds).then(res => {
      if (res.success) {
        this.setState({ visible: false });

        message.success("删除成功");

        this.reload();
      }
    });
  };
  handleAdd = () => {
    let { data } = this.props;
    this.addTransactionModal.show(data);
  };
  render() {
    const { data } = this.props;
    const { selectRowsCount, visible } = this.state;

    return (
      <div>
        <GridManager
          onSelect={selectData => {
            this.handleSelect(selectData);
          }}
          columns={this.getColumns()}
          url={`/receipt/plan/detail/get_declarations?id=${data.id}`}
          gridWrapClassName="grid-panel auto-width-grid"
          pagination={false}
          mod={this}
          scroll={{
            x: "150%"
          }}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          <div>
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-action fr">
                <Button icon="plus" onClick={this.handleAdd} />
              </div>
              <div
                className={ClassNames({
                  "vant-float-bar": true,
                  open: selectRowsCount
                })}
              >
                已选中
                <span className="count">{selectRowsCount}</span>
                项
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.handleRemove}>
                  <Icon type="delete" />移除关联
                </a>
              </div>
            </div>
          </div>
        </GridManager>
        <div ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
          <AddTransactionModal
            container={this.container}
            reload={this.reload}
            ref={ref => (this.addTransactionModal = ref)}
          />
        </div>

        <div ref={ref => (this.modalContainer = ReactDom.findDOMNode(ref))} />

        <Modal
          wrapClassName="vertical-center-modal"
          className={`ant-confirm ant-confirm-confirm`}
          visible={visible}
          width={420}
          closable={false}
          maskClosable={false}
          getContainer={() => this.modalContainer}
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          footer={null}
        >
          <div className="ant-confirm-body-wrapper">
            <div className="ant-confirm-body">
              <i className="anticon anticon-question-circle" />
              <span className="ant-confirm-title">确定删除选中关联交易?</span>
              <div className="ant-confirm-content" />
            </div>
            <div className="ant-confirm-btns">
              <Button onClick={this.handleCancel}>取消</Button>
              <Button onClick={this.handleSubmit}>确定</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
