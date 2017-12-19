import React from "react";
import { Button, Modal, message, Spin } from "antd";
import moment from "moment";

import GM from "lib/gridManager";

import Base from "components/main/Base";

import Receipt from "model/Finance/receipt";

import style from "./addTransactionModal.scss";

const { GridManager } = GM;

export default class AddPlanModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      data: []
    };
  }
  componentWillMount() {
    this.receipt = new Receipt();
  }
  componentDidMount() {}
  show(data) {
    this.setState({ visible: true, loading: true, receiptPlanId: data.id });

    this.getData(data.productId);
  }
  getData(productId) {
    this.receipt.getDeclaration(productId).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        this.setState({ data: res.result });
      }
    });
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
      }
    ];

    return columns;
  };
  handleSelect(selectData) {
    let { selectIds } = selectData;
    this.setState({ selectIds });
  }
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    const { selectIds, receiptPlanId } = this.state;

    if (!selectIds || selectIds.length === 0) {
      message.error("请至少勾选一个报单");
      return;
    }

    let formData = {
      receiptPlanId,
      ids: selectIds.join(",")
    };

    this.receipt.addDeclaration(formData).then(res => {
      if (res.success) {
        this.setState({
          visible: false
        });
        message.success("新增关联成功.");
        this.props.reload();
      }
    });
  };

  render() {
    let { visible, loading, data } = this.state;
    return (
      <Modal
        visible={visible}
        title={"新增关联交易"}
        width={700}
        maskClosable={false}
        getContainer={() => this.props.container}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        okText="保存"
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
      >
        <Spin spinning={loading}>
          <div className={style.title}>
            可新增的交易(审批通过且没有关联回款的报单)：
          </div>
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            dataSource={data}
            gridWrapClassName="grid-panel auto-width-grid"
            disabledAutoLoad={true}
            pagination={false}
            mod={this}
            scroll={{
              x: "150%",
              y: 300
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          />
        </Spin>
      </Modal>
    );
  }
}
