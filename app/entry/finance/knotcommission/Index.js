import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Button, Dropdown, Icon, Menu } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";

import VisitViewModal from "services/operation/visitViewModal";

import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import SettleCommissionModal from "services/finance/commission/settleCommissionModal";
import CommissionRecordModal from "services/finance/commission/commissionRecordModal";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridRangeFilter,
  GridCheckboxFilter,
  GridCitysFilter
} = GM;

export default class KnotCommissionIndex extends Base {
  static get NAME() {
    return "KnotCommissionIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[KnotCommissionIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "全部报单",
        value: "all"
      },
      filters: {
        dic_leads_type: [],
        dic_leads_channel: [],
        dic_leads_status: [],
        dic_leads_visit_status: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();

    this.getDictionary();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  showFloat = (float, data) => {
    const current = this.state.currentFloat;
    if (current && current != float) {
      this[current].hide();
    }
    this.setState({
      currentFloat: float
    });
    this[float].show(data);
  };
  getDictionary() {
    this.dictionary
      .gets(
        "dic_commission_type,dic_leads_channel,dic_leads_status,dic_customer_status"
      )
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

  getColumns = () => {
    const {
        dic_leads_type,
        dic_leads_channel,
        dic_leads_status,
        dic_customer_status
      } = this.state.filters,
      columns = [
        {
          title: "报单编号",
          dataIndex: "number",
          width: 100,
          fixed: "left",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="number" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return (
              <a
                role="floatPane"
                onClick={e => {
                  this.showFloat("declarationDetailFloat", record);
                }}
              >
                {record.number}
              </a>
            );
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
                role="floatPane"
                title={record.productName}
                onClick={() => {
                  this.showFloat("productDetailFloat", {
                    id: record.productId
                  });
                }}
              >
                {record.productName}
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
            return (
              <a
                role="floatPane"
                title={record.customerName}
                onClick={() => {
                  this.showFloat("customerDetailFloat", {
                    id: record.customerId
                  });
                }}
              >
                {record.customerName}
              </a>
            );
          }
        },

        {
          title: "客户编号",
          dataIndex: "customerNumber",
          width: 100,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="customerNumber" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.customerNumber;
          }
        },
        {
          title: "认购金额",
          dataIndex: "dealAmount",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="dealAmount" mod={this} />
              <GridRangeFilter filterKey="dealAmount" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return `${record.dealAmount}万元`;
          }
        },
        {
          title: "报单确认日期",
          dataIndex: "commitDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="commitDate" mod={this} />
              <GridDateFilter filterKey="commitDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(record.commitDate, "YYYY-MM-DD");
          }
        },
        {
          title: "成单人",
          dataIndex: "userName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="userName" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.userName;
          }
        },
        {
          title: "结佣次数",
          dataIndex: "totalCount",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridRangeFilter filterKey="totalCount" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.totalCount || 0;
          }
        },
        {
          title: "结佣金额",
          dataIndex: "totalAmount",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridRangeFilter filterKey="totalAmount" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return `${record.totalAmount || 0}元`;
          }
        },
        {
          title: "操作",
          width: 150,
          fixed: "right",
          render: (text, record) => {
            return (
              <div className="operation">
                <a
                  onClick={() =>
                    this.handleModal("settleCommissionModal", record)}
                >
                  录入佣金
                </a>
                <a
                  onClick={() =>
                    this.handleModal("commissionRecordModal", record)}
                >
                  查看
                </a>
              </div>
            );
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "customerName");
    this.resetFilterByKey(params, "customerNumber");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "dealAmount");
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "userName");
    this.resetFilterByKey(params, "totalAmount");
    this.resetFilterByKey(params, "totalCount");
    this.resetFilterByKey(params, "commitDate");

    params.scope = this.state.menuName.value;

    if (params.totalAmount && params.totalAmount.length) {
      params.totalAmountStart = params.totalAmount[0];
      params.totalAmountEnd = params.totalAmount[1];
      delete params.totalAmount;
    }
    if (params.dealAmount && params.dealAmount.length) {
      params.dealAmountStart = params.dealAmount[0];
      params.dealAmountEnd = params.dealAmount[1];
      delete params.dealAmount;
    }
    if (params.totalCount && params.totalCount.length) {
      params.totalCountStart = params.totalCount[0];
      params.totalCountEnd = params.totalCount[1];
      delete params.totalCount;
    }
    if (params.commitDate && params.commitDate.length) {
      params.commitDateStart = params.commitDate[0];
      params.commitDateEnd = params.commitDate[1];
      delete params.commitDate;
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
          ["dateRange", "numberRange"].indexOf(params[key][0].filterType) > -1
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

  reload = () => {
    this.gridManager.grid.reload();
  };
  handleModal(modal, data) {
    this[modal].show(data);
  }

  handleMenuClick = e => {
    let menuName = {
      text: e.item.props.children,
      value: e.key
    };

    this.setState(
      {
        menuName
      },
      () => {
        this.reload();
      }
    );
  };
  render() {
    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>财务管理</Breadcrumb.Item>
          <Breadcrumb.Item>结佣管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/knot/commission/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div>
              <div className={`vant-filter-bar clearfix`}>
                <div className="vant-filter-bar-title fl">
                  <Dropdown
                    overlay={
                      <Menu onClick={this.handleMenuClick}>
                        <Menu.Item key="all">全部报单</Menu.Item>
                        <Menu.Item key="month">本月报单</Menu.Item>
                        <Menu.Item key="unprocess">未结佣报单</Menu.Item>
                      </Menu>
                    }
                  >
                    <a className={`ant-dropdown-link ${style.title}`}>
                      {menuName.text}
                      <Icon type="down" />
                    </a>
                  </Dropdown>
                </div>
                <div className="fl">
                  <FilterBar gridManager={this.gridManager} ref="filterBar" />
                </div>
                <div className="fr" />
              </div>
            </div>
          </GridManager>
          <DeclarationDetailFloat
            reload={this.reloadGrid}
            ref={ref => (this.declarationDetailFloat = ref)}
          />
          <CustomerDetailFloat
            reload={this.reloadGrid}
            ref={ref => (this.customerDetailFloat = ref)}
          />
          <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
          <SettleCommissionModal
            reload={this.reload}
            ref={ref => {
              if (ref) {
                this.settleCommissionModal = ref;
              }
            }}
          />
          <CommissionRecordModal
            reload={this.reload}
            ref={ref => {
              if (ref) {
                this.commissionRecordModal = ref;
              }
            }}
          />
        </div>
      </Page>
    );
  }
}
