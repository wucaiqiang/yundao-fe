import React from "react";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import { Breadcrumb, Button, Dropdown, Icon, Popover, message } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import GM from "lib/gridManager";
import Utils from "utils/";
import extend from "extend";

// import style from "./Index.scss";

const icon_add = "/assets/images/icon/新增";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

export default class SaleRedemption extends Base {
  static get NAME() {
    return "SaleRedemption";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SaleRedemption.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true
    };
  }
  componentWillMount() {
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  getColumns = () => {
    const columns = [
      {
        title: "报单编号",
        dataIndex: "isSend",
        width: 100,
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="isSend" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              title={record.title}
              onClick={() => this.handleEditModal(record.id, false)}
            >
              {record.title}
            </a>
          );
        }
      },
      {
        title: "客户名称",
        dataIndex: "customerName",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="customerName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return <a title={record.customerName}>{record.customerName}</a>;
        }
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        width: 200,
        className: "ant-table-col",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="productName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              title={record.title}
              onClick={() => this.handleEditModal(record.id, false)}
            >
              {record.title}
            </a>
          );
        }
      },
      {
        title: "认购金额",
        dataIndex: "content",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="content" mod={this} />
            <GridInputFilter filterKey="content" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.content;
        }
      },
      {
        title: "打款日期",
        dataIndex: "createDate",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="createDate" mod={this} />
            <GridDateFilter filterKey="createDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "报单时间",
        dataIndex: "updateDate",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="updateDate" mod={this} />
            <GridDateFilter filterKey="updateDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "赎回情况",
        dataIndex: "dfdfdf",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="dfdfdf" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return text;
        }
      },
      {
        title: "操作",
        width: 180,
        fixed: "right",
        render: (text, record) => {
          return (
            <span>
              <a href="">赎回剩余份额</a>
              <a href="">赎回记录</a>
            </span>
          );
        }
      }
    ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "isSend");
    this.resetFilterByKey(params, "status");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "noticeTypeIds");
    this.resetFilterByKey(params, "title");
    this.resetFilterByKey(params, "content");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "updateDate");

    if (params.createDate && params.createDate.length) {
      params.createDateStart = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }
    if (params.updateDate && params.updateDate.length) {
      params.updateDateStart = params.updateDate[0];
      params.updateDateEnd = params.updateDate[1];
      delete params.updateDate;
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
          params[key][0].filterType === "dateRange"
        ) {
          params[key] = params[key][0].values;
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
  reloadGrid() {
    this.gridManager.grid.reload();
  }

  render() {
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>我的赎回</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/product/notice/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "110%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                <Button
                  className={"btn_add"}
                  onClick={() => this.handleEditModal(null, true)}
                >
                  <img src={icon_add + "@1x.png"} />
                  新增赎回
                </Button>
              </div>
            </div>
          </GridManager>
        </div>
      </Page>
    );
  }
}
