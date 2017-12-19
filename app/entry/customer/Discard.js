import React from "react";
import PropTypes from "prop-types";
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

import ClassNames from "classnames";

import GM from "lib/gridManager";
import Utils from "utils/";
import extend from "extend";

import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import Dictionary from "model/dictionary";
import Customer from "model/Customer";

import style from "./Index.scss";

const icon_operation = "/assets/images/icon/操作";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridCitysFilter
} = GM;

export default class CustomerDiscard extends Base {
  static get NAME() {
    return "CustomerDiscard";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[CustomerDiscard.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      filters: {
        dic_sex: [],
        dic_customer_level: [],
        dic_yes_or_no: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.customer = new Customer();

    this.getDictionary();
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  getDictionary() {
    this.dictionary
      .gets("dic_sex,dic_customer_level,dic_yes_or_no")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res.result.map(item => {
            filters[item.value] = item.selections;
          });

          this.setState({ filters });
        }
      });
  }
  getAreaText(record) {
    if (record.provinceText && record.cityText) {
      return `${record.provinceText}/${record.cityText}`;
    } else if (!record.provinceText) {
      return record.cityText;
    } else if (!record.cityText) {
      return record.provinceText;
    } else {
      return null;
    }
  }
  getColumns = () => {
    const { dic_sex, dic_customer_level, dic_yes_or_no } = this.state.filters,
      columns = [
        {
          title: "跟进",
          width: 50,
          fixed: "left",
          render: (text, record) => {
            return (
              <img
                src={icon_operation + "@1x.png"}
                srcSet={icon_operation + "@2x.png 2x"}
                onClick={() => this.showModal("customerFollowModal", record)}
              />
            );
          }
        },
        {
          title: "客户名称",
          dataIndex: "name",
          fixed: "left",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="name" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return (
              <a
                role="customerName"
                onClick={e => {
                  this.editCustomerFloat.show(record);
                }}
              >
                {record.name}
              </a>
            );
          }
        },
        {
          title: "客户编号",
          dataIndex: "number",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="number" mod={this} />
            </div>
          )
        },
        {
          title: "手机号码",
          dataIndex: "mobile",
          width: 120,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter
                filterKey="mobile"
                mod={this}
                placeholder="请输入正确手机号"
              />
            </div>
          )
        },
        {
          title: "性别",
          dataIndex: "sexs",
          width: 80,
          filters: dic_sex,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="sexs" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.sexText;
          }
        },
        {
          title: "地域",
          dataIndex: "cityCode",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCitysFilter filterKey="cityCode" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return this.getAreaText(record);
          }
        },
        {
          title: "重要级别",
          dataIndex: "levels",
          width: 100,
          sort: true,
          filters: dic_customer_level,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="levels" mod={this} />
              <GridCheckboxFilter filterKey="levels" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.levelText;
          }
        },
        {
          title: "是否成交",
          dataIndex: "isDeal",
          width: 100,
          filters: dic_yes_or_no,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="isDeal" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.isDealText;
          }
        },
        {
          title: "最近成交日期",
          dataIndex: "dealDate",
          width: 130,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="dealDate" mod={this} />
              <GridDateFilter filterKey="dealDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "分配日期",
          dataIndex: "distributionDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="distributionDate" mod={this} />
              <GridDateFilter filterKey="distributionDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        }
      ];

    this.columns = columns;
    return columns
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "sexs");
    this.resetFilterByKey(params, "cityCode");
    this.resetFilterByKey(params, "levels");
    this.resetFilterByKey(params, "isDeal");
    this.resetFilterByKey(params, "dealDate");
    this.resetFilterByKey(params, "distributionDate");

    if (params.cityCode && params.cityCode.length) {
      params.cityCode = params.cityCode.join(",");
    }

    if (params.DealDate && params.DealDate.length) {
      params.DealDateBegin = params.DealDate[0];
      params.DealDateEnd = params.DealDate[1];
      delete params.DealDate;
    }
    if (params.distributionDate && params.distributionDate.length) {
      params.distributionDateBegin = params.distributionDate[0];
      params.distributionDateEnd = params.distributionDate[1];
      delete params.distributionDate;
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

    params.scope = this.state.menuName.value;

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
        } else if (
          params[key].length === 1 &&
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
  handleSelect(selectData) {
    let state = this.state;

    state.selectIds = selectData.selectIds;
    state.selectRowsCount = selectData.selectRowsCount;
    state.selectRowsData = selectData.selectRowsData;

    this.setState(state);
  }
  showModal(modal, data) {
    this.refs[modal].show(data);
  }
  /**
   * 关注
   *
   * @returns
   * @memberof CustomerDiscard
   */
  handleFollow = () => {
    let { selectIds: customerIds } = this.state,
      _this = this;
    this.customer.focus(customerIds).then(res => {
      if (res.success) {
        Modal.success({
          title: "关注客户成功",
          content: "可在左上角筛选项中选择查看全部关注的客户。",
          okText: "确定"
        });

        _this.gridManager.clearRowSelect();
      }
    });
  };
  reload = () => {
    this.gridManager.grid.reload();
  };
  render() {
    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>废弃客户</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/customer/get_my_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "120%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
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
                <a className="ant-btn-link" onClick={this.handleFollow}>
                  <Icon type="heart-o" />还原
                </a>
              </div>
            </div>
          </GridManager>
        </div>
        <CustomerDetailFloat
            reload={this.reload}
            ref={ref => (this.editCustomerFloat = ref)}
          />
      </Page>
    );
  }
}
