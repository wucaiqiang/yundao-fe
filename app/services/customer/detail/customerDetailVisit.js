import React, { Component } from "react";

import Utils from "utils/";

import DataGrid from "components/dataGrid";

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


export default class CustomerDetailVisit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customerId: this.props.customerId
    };
  }
  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
    const customerId = this.state.customerId;
    if (nextProps.customerId !== customerId) {
      this.setState(
        {
          customerId: nextProps.customerId
        },
        () => {
          this.grid.load();
        }
      );
    }
  }

  getColumns = () => {
    const columns = [
      {
        title: "回访时间",
        dataIndex: "visitDate",
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "回访事由",
        dataIndex: "matter",
        render: (text, record) => {
          return record.matter;
        }
      },
      {
        title: "回访方式",
        dataIndex: "typeText"
      },
      {
        title: "回访状态",
        dataIndex: "statusText"
      },
      {
        title: "回访内容",
        dataIndex: "content",
        render: (text, record) => {
          return (
            <span title={record.content}>
              {record.content}
            </span>
          );
        }
      },
      {
        title: "回访人",
        dataIndex: "userName"
      }
    ];

    return columns;
  };
  render() {
    return (
      <GridManager
        url={`/user/visit/get_page_for_customer_detail?customerId=${this.state
          .customerId}`}
        noRowSelection={true}
        columns={this.getColumns()}
        ref={grid => {
          grid && (this.grid = grid);
        }}
      />
    );
  }
}
