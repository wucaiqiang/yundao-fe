import React, { Component } from "react";
import moment from "moment";

import GM from "lib/gridManager";

import style from "./index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter
} = GM;

export default class DetailRecordInfo extends Component {
  constructor(props) {
    super(props);
  }
  state = {};

  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
    //重绘使得gridmana
    this.setState({
      gridManager: this.gridManager
    });
  }
  getColumns = () => {
    const columns = [
      {
        title: "操作人",
        dataIndex: "creator",
        width: "15%",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="creator" mod={this} />
          </div>
        )
      },
      {
        title: "部门",
        dataIndex: "department",
        width: "15%",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="department" mod={this} />
          </div>
        )
      },

      {
        title: "时间",
        dataIndex: "createDate",
        width: "15%",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="createDate" mod={this} />
            <GridDateFilter filterKey="createDate" mod={this} />
          </div>
        ),
        render: text => {
          return text && moment(text).format("YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "行为",
        dataIndex: "actionInfo"
      }
    ];

    return columns;
  };

  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "creator");
    this.resetFilterByKey(params, "department");
    this.resetFilterByKey(params, "createDate");

    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }
    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params.sort.replace("end", "");
    }

    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key] instanceof Array) {
        if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "dateRange"
        ) {
          params[key] = params[key][0].values;
        } else if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "citys"
        ) {
          params[key] = params[key][0].values.value;
        } else {
          params[key] = params[key].join(",");
        }
      }
      if (params[key] != "") {
        if (newKey) {
          params[newKey] = params[key];
          delete params[key];
        }
      }
    }
    return params;
  }
  render() {
    const { projectId } = this.props;
    console.log("this.gridManager", this.gridManager);
    console.log("this.", this);
    return (
      <div className={style.recordInfo}>
        <GridManager
          noRowSelection={true}
          columns={this.getColumns()}
          url={`/assets/project/record/get_page?projectId=${projectId}`}
          beforeLoad={params => {
            return this.beforeLoad(params);
          }}
          mod={this}
          scroll={{
            x: "100%"
          }}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          <div className={`vant-filter-bar clearfix`}>
            <div className="fl">
              <FilterBar gridManager={this.state.gridManager} ref="filterBar" />
            </div>
          </div>
        </GridManager>
      </div>
    );
  }
}
