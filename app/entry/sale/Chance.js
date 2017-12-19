import React from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Tooltip,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import GM from "lib/gridManager";
import Utils from "utils/";
import extend from "extend";

// import style from "./Index.scss";

const { Option } = Select;
const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

export default class SaleChance extends Base {
  static get NAME() {
    return "SaleChance";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SaleChance.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true
    };

    this.popconfirm = [];
    this.popSelect = [];
    this.popSelectValue = [];
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
    const fnRender = this.renderPopConfirm,
      columns = [
        {
          title: "操作",
          width: 50,
          fixed: "left",
          render: (text, record) => {
            return (
              <Popconfirm
                overlayClassName={
                  record.status === "EnumNoticeStatus.enum.PASS"
                    ? "ant-popover-pass"
                    : ""
                }
                placement="bottomLeft"
                title={fnRender(record)}
                onConfirm={() => this.handleChangeStatus(record.id)}
              >
                <img
                  src={icon_operation + "@1x.png"}
                  srcSet={icon_operation + "@2x.png 2x"}
                />
              </Popconfirm>
            );
          }
        },
        {
          title: "预约编号",
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
          title: "确认状态",
          dataIndex: "status",
          // filters: EnumNoticeStatus.dictionary,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="status" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.sd;
          }
        },
        {
          title: "客户名称",
          dataIndex: "productName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="productName" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return (
              <a  title={record.productName}>
                {record.productName}
              </a>
            );
          }
        },
        {
          title: "产品名称",
          dataIndex: "title",
          width: 200,
          className: "ant-table-col",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="title" mod={this} />
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
          title: "预约金额",
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
          title: "预计打款日期",
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
          title: "预约时间",
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
        }
      ];

    this.columns = columns;
    return columns
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
  handleChangeStatus = id => {
    let _this = this,
      status = this.popSelectValue[id] || "-1";

    //排除审批通过的
    if (_this.popSelect[id]) {
      if (status === "-1") {
        message.warning("请选择操作");
        return;
      }

      this.notice.flow({ id, status }).then(res => {
        if (res.success) {
          message.success("保存成功");
          _this.reloadGrid();
          _this.popSelectValue[id] = "-1";
        }
      });
    }
  };
  renderPopConfirm = record => {
    let options = [];

    if (record.status === "EnumNoticeStatus.enum.PENDING") {
      options.push(
        <Option key="1" value="2">
          申请发布
        </Option>
      );
    } else if (record.status === "EnumNoticeStatus.enum.REVIEW") {
      options.push(
        <Option key="1" value="5">
          撤销发布申请
        </Option>
      );
    } else if (
      record.status === "EnumNoticeStatus.enum.REJECT" ||
      record.status === "EnumNoticeStatus.enum.UNDO"
    ) {
      options.push(
        <Option key="1" value="2">
          重新申请发布
        </Option>
      );
    }

    return (
      <div
        ref={ref => (this.popconfirm[record.id] = ReactDom.findDOMNode(ref))}
      >
        <div>
          <span className="column">审批结果：</span>
          {"EnumNoticeStatus.keyValue[record.status]"}
        </div>
        {record.status === "EnumNoticeStatus.enum.REJECT"
          ? <div>
              <span className="column">驳回原因：</span>
              {record.reason}
            </div>
          : null}

        <div>
          <span className="column">发布状态：</span>
          {record.isSend !== null && "EnumNoticeSend.keyValue[record.isSend]"}
        </div>
        {record.status === "EnumNoticeStatus.enum.PASS"
          ? null
          : <div>
              <span className="column">操作：</span>
              <Select
                ref={ref => (this.popSelect[record.id] = ref)}
                defaultValue="-1"
                value={this.popSelectValue[record.id]}
                style={{ width: 150 }}
                getPopupContainer={() => this.popconfirm[record.id]}
                onChange={value => (this.popSelectValue[record.id] = value)}
              >
                <Option key="0" value="-1">
                  选择操作
                </Option>
                {options}
              </Select>
            </div>}
      </div>
    );
  };
  render() {
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>销售机会</Breadcrumb.Item>
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
                  <img
                    src={icon_add + "@1x.png"}
                    srcSet={icon_add + "@2x.png 2x"}
                  />
                  新增预约
                </Button>
              </div>
            </div>
          </GridManager>
        </div>
      </Page>
    );
  }
}
