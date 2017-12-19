import React, { Component } from "react";
import ReactDom from "react-dom";

import { Button, Icon, Modal, message } from "antd";
import moment from "moment";
import ClassNames from "classnames";

import GM from "lib/gridManager";

import Base from "components/main/Base";

import AddCashModal from "services/finance/receiptplan/addCashModal";

import Receipt from "model/Finance/receipt";

import style from "./Index.scss";

const { GridManager } = GM;

export default class DetailPaymentRecord extends Base {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: this.props.data
    };
  }

  componentWillMount() {
    this.receipt = new Receipt();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data) {
    }
  }
  getColumns = () => {
    const columns = [
      {
        title: "回款日期",
        dataIndex: "payDate",
        render: (text, record) => {
          return moment(text).format("YYYY-MM-DD");
        }
      },
      {
        title: "回款金额",
        dataIndex: "amount",
        width: 140,
        render: text => {
          return `${text}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      },
      {
        title: "回款单位",
        dataIndex: "payUnit"
      },
      {
        title: "回款银行",
        dataIndex: "bankName"
      },
      {
        title: "回款账号",
        dataIndex: "payAccount"
      },
      {
        title: "是否开票",
        dataIndex: "isInvoicedText"
      },
      {
        title: "开票日期",
        dataIndex: "invoicedDate",
        render: (text, record) => {
          return text && moment(text).format("YYYY-MM-DD");
        }
      },
      {
        title: "备注",
        dataIndex: "remark"
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

    this.receipt.delRecord(selectIds).then(res => {
      if (res.success) {
        this.setState({ visible: false });

        message.success("删除成功");

        this.reload();
      }
    });
  };
  handleAdd = () => {
    let { data } = this.props;

    this.addCashModal.show(data);
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
          url={`/receipt/plan/detail/get_receipts?id=${data.id}`}
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
                  <Icon type="delete" />删除
                </a>
              </div>
            </div>
          </div>
        </GridManager>
        <div ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
          <AddCashModal
            container={this.container}
            reload={this.reload}
            ref={ref => (this.addCashModal = ref)}
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
              <span className="ant-confirm-title">确定删除选中回款记录?</span>
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
