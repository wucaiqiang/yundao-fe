import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Button, Dropdown, Icon, Menu, Popover } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";

import AllotCsModal from "services/operation/allotCsModal";
import AllotFpModal from "services/operation/allotFpModal";
import VisitViewModal from "services/operation/visitViewModal";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridCitysFilter
} = GM;

export default class OperationClue extends Base {
  static get NAME() {
    return "OperationClue";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[OperationClue.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "未处理的线索",
        value: "unprocess"
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
  getDictionary() {
    this.dictionary
      .gets(
        "dic_leads_type,dic_leads_channel,dic_leads_status,dic_customer_status"
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
          title: "客户名称",
          dataIndex: "customerName",
          width: 100,
          fixed: "left",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="customerName" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return (
              <a
                role="customerName"
                onClick={e => {
                  this.handleModal("editCustomerFloat", {
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
          dataIndex: "number",
          width: 100,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="number" mod={this} />
            </div>
          )
        },
        {
          title: "手机号码",
          dataIndex: "mobile",
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
          title: "负责人",
          dataIndex: "fpName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="fpName" mod={this} />
            </div>
          )
        },
        {
          title: "类型",
          dataIndex: "types",
          filters: dic_leads_type,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="types" mod={this} />
            </div>
          ),
          render(text, record) {
            return record.typeText;
          }
        },
        {
          title: "渠道",
          dataIndex: "channels",
          filters: dic_leads_channel,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="channels" mod={this} />
            </div>
          ),
          render(text, record) {
            return record.channelText;
          }
        },
        {
          title: "内容",
          dataIndex: "content",
          width: 200,
          className: "ant-table-col",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="content" mod={this} />
            </div>
          )
        },
        {
          title: "时间",
          dataIndex: "createDate",
          width: 140,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="createDate" mod={this} />
              <GridDateFilter filterKey="createDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
          }
        },
        {
          title: "客户状态",
          dataIndex: "customerStatuss",
          filters: dic_customer_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="customerStatuss" mod={this} />
            </div>
          ),
          render(text, record) {
            return record.customerStatusText;
          }
        },
        {
          title: "操作",
          width: 180,
          fixed: "right",
          render: (text, record) => {
            return (
              <div className="operation">
                {record.canAllotToCs ? (
                  <a
                    onClick={() =>
                      this.handleModal("allotCsModal", {
                        customerId: record.customerId
                      })
                    }
                  >
                    分配回访
                  </a>
                ) : (
                  <Popover
                    placement="topRight"
                    content={"无权限操作"}
                    arrowPointAtCenter
                  >
                    <span className="disabled">分配回访</span>
                  </Popover>
                )}
                {record.canAllotToFp ? (
                  <a
                    onClick={() =>
                      this.handleModal("allotFpModal", {
                        customerId: record.customerId
                      })
                    }
                  >
                    分配负责人
                  </a>
                ) : (
                  <Popover
                    placement="topRight"
                    content={"无权限操作"}
                    arrowPointAtCenter
                  >
                    <span className="disabled">分配负责人</span>
                  </Popover>
                )}
                {record.canViewVisitDetail ? (
                  <a onClick={() => this.handleModal("visitViewModal", record)}>
                    查看
                  </a>
                ) : null}
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
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "fpName");
    this.resetFilterByKey(params, "types");
    this.resetFilterByKey(params, "channels");
    this.resetFilterByKey(params, "content");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "customerStatuss");

    params.scope = this.state.menuName.value;

    if (params.visitDate && params.createDate.length) {
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
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>销售线索管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/leads/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
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
                <div className="vant-filter-bar-title fl">
                  <Dropdown
                    overlay={
                      <Menu onClick={this.handleMenuClick}>
                        <Menu.Item key="unprocess">未处理的线索</Menu.Item>
                        <Menu.Item key="all"> 全部线索</Menu.Item>
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
              </div>
            </div>
          </GridManager>
          <AllotCsModal
            reload={this.reload}
            ref={ref => (this.allotCsModal = ref)}
          />
          <AllotFpModal
            reload={this.reload}
            ref={ref => (this.allotFpModal = ref)}
          />
          <VisitViewModal ref={ref => (this.visitViewModal = ref)} />
        </div>
        <CustomerDetailFloat
          reload={this.reload}
          ref={ref => (this.editCustomerFloat = ref)}
        />
      </Page>
    );
  }
}
