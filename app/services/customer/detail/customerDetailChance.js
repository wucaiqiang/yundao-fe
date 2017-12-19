import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { Button } from "antd";
import Utils from "utils/";

import DataGrid from "components/dataGrid";

import Clue from "model/Clue";

import EnumCustomer from "enum/enumCustomer";

import ClueDealModal from "services/operation/clueDealModal";

import style from "./customerDetail.scss";

import GM from "lib/gridManager";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridRangeFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

const { EnumCustomerStatus } = EnumCustomer;

export default class CustomerDetailChance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customerId: this.props.customerId,
      count: {
        leadsCount: 0,
        chanceCount: 0
      }
    };
  }
  componentWillMount() {
    this.clue = new Clue();
    this.getCount(this.props.customerId);
  }

  componentWillReceiveProps(nextProps) {
    const customerId = this.state.customerId;
    if (nextProps.customerId !== customerId) {
      this.setState(
        {
          customerId: nextProps.customerId
        },
        () => {
          this.getCount(nextProps.customerId);
          // this.gridManager.grid.load();
          this.gridManager.grid.reload();
        }
      );
    }
  }
  componentDidMount() {
    // this.clueDealModal.show({})
  }
  getCount(customerId) {
    this.clue.getCount(customerId).then(res => {
      if (res.success) {
        this.setState({ count: res.result });
      }
    });
  }
  getColumns = () => {
    const columns = [
      {
        title: "类型",
        dataIndex: "typeText"
      },
      {
        title: "渠道",
        dataIndex: "channelText"
      },
      {
        title: "内容",
        dataIndex: "content",
        className: "ant-table-col"
      },
      {
        title: "线索时间",
        dataIndex: "createDate",
        width: 110,
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "处理状态",
        dataIndex: "statusText",
        width: 100
      },
      {
        title: "处理人",
        dataIndex: "processUserName"
      },
      {
        title: "处理时间",
        dataIndex: "processDate",
        width: 110,
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 80,
        fixed: "right",
        render: (text, record) => {
          return record.canProcess ? (
            <a onClick={() => this.clueDealModal.show({ id: record.id })}>处理</a>
          ) : null;
        }
      }
    ];

    return columns;
  };
  reloadGrid = () => {
    this.gridManager.grid.reload();

    let { parent } = this.props;

    if (parent) {
      parent.customerDetailFollow.getData(this.state.customerId);
    }
  };
  render() {
    let { customerId, count } = this.state;

    return (
      <div className={style.trading}>
        <div className={style.tags}>
          <span>销售线索({count.leadsCount})</span>
          {/*   <a href="#declarationList">
            销售机会({count.declarationCount})
    </a> */}
        </div>
        <div className={style.title} id="reservationList">
          销售线索
        </div>
        <GridManager
          rowKey="id"
          url={`/leads/customer/detail/get_page?customerId=${customerId}`}
          noRowSelection={true}
          columns={this.getColumns()}
          ref={grid => {
            grid && (this.gridManager = grid);
          }}
        />
        <div ref={ref => (this.container = findDOMNode(ref))}>
          <ClueDealModal
            container={this.container}
            ref={ref => (this.clueDealModal = ref)}
            reload={this.reloadGrid}
          />
        </div>
      </div>
    );
  }
}
