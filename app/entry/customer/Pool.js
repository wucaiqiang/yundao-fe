import React from "react";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Menu,
  Popover,
  Select,
  Tooltip,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";
import extend from "extend";

import EditCustomerModal from "services/customer/editCustomerModal";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";
import CustomerDeployModal from "services/customer/pool/customerDeployModal";
import CustomerRecoverModal from "services/customer/pool/customerRecoverModal";
import CustomerAllotModal from "services/customer/pool/customerAllotModal";
import ImportCustomerModal from "services/customer/import/importCustomerModal";

import Dictionary from "model/dictionary";
import Customer from "model/Customer";

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

const icon_deploy = "/assets/images/customer/调配";
const icon_reconver = "/assets/images/customer/分配回访";
const icon_allot = "/assets/images/customer/回收";

export default class CustomerPool extends Base {
  static get NAME() {
    return "CustomerPool";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[CustomerPool.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: { text: "全部", value: "all" },
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
          title: "客户名称",
          dataIndex: "name",
          width: 120,
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
                  record.open_source = "customer_pool";
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
          title: "性别",
          dataIndex: "sexs",
          filters: dic_sex,
          width: 80,
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
          dataIndex: "cityCodes",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCitysFilter filterKey="cityCodes" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return this.getAreaText(record);
          }
        },
        {
          title: "重要级别",
          dataIndex: "levels",
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
          dataIndex: "isDeals",
          filters: dic_yes_or_no,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="isDeals" mod={this} />
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
          title: "创建日期",
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
        }
      ];

    this.columns = columns;
    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "sexs");
    this.resetFilterByKey(params, "cityCodes");
    this.resetFilterByKey(params, "levels");
    this.resetFilterByKey(params, "isDeals");
    this.resetFilterByKey(params, "dealDate");
    this.resetFilterByKey(params, "fpName");
    this.resetFilterByKey(params, "createDate");

    if (params.cityCodes && params.cityCodes.length) {
      params.cityCodes = params.cityCodes.join(",");
    }

    if (params.dealDate && params.dealDate.length) {
      params.dealDateBegin = params.dealDate[0];
      params.dealDateEnd = params.dealDate[1];
      delete params.dealDate;
    }
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
  /**
   * 调配
   *
   * @returns
   * @memberof CustomerPool
   */
  handleModal = modal => {
    let { selectRowsData } = this.state,
      customerIds = [],
      customerNames = [];

    selectRowsData.map(item => {
      customerIds.push(item.id);
      customerNames.push(item.name);
    });

    let data = {
      customerIds: customerIds.join(","),
      customerNames: customerNames.join("、")
    };
    this[modal].show(data);
  };
  handleMenuClick = e => {
    let menuName = { text: e.item.props.children, value: e.key };

    this.setState({ menuName }, () => {
      // this.gridManager.grid.load();
      this.gridManager.grid.reload();
    });
  };
  reload = () => {
    this.gridManager.grid.reload();
  };
  render() {
    const hasAdd = Utils.checkPermission("customer.pool.add");
    const hasImport = Utils.checkPermission("customer.import.multi_from_pool");

    const PermissionButton = ((hasAdd, hasImport) => {
      if (hasAdd) {
        if (hasImport) {
          return (
            <div className={style.import_btn}>
              <Dropdown.Button
                overlay={
                  <div className={style.import}>
                    <Menu
                      onClick={(item, key, selectedKeys) => {
                        this.importCustomerModal.show({
                          request: "/api/customer/import/multi_from_pool"
                        });
                      }}
                    >
                      <Menu.Item key="import_customer">
                        <span>导入客户</span>
                      </Menu.Item>
                    </Menu>
                  </div>
                }
                onClick={() => {
                  this.editCustomerModal.show({ origin: "pool" });
                }}
              >
                <img src={"/assets/images/icon/新增@2x.png"} alt="" />
                新增客户
              </Dropdown.Button>
            </div>
          );
        } else {
          return (
            <div className={style.import_btn}>
              <Button
                onClick={() => {
                  this.editCustomerModal.show({ origin: "pool" });
                }}
              >
                <img src={"/assets/images/icon/新增@2x.png"} alt="" />
                新增客户
              </Button>
            </div>
          );
        }
      } else if (hasImport) {
        return (
          <div className={style.import_btn}>
            <Button
              onClick={() => {
                this.importCustomerModal.show({
                  request: "/api/customer/import/multi_from_pool"
                });
              }}
            >
              <img src={"/assets/images/icon/新增@2x.png"} alt="" />
              导入客户
            </Button>
          </div>
        );
      }
      return null;
    })(hasAdd, hasImport);

    const PermissionLink = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("customerDeployModal")}
        >
          <img
            src={icon_deploy + "@1x.png"}
            srcSet={icon_deploy + "@2x.png 2x"}
            alt="调配"
          />调配
        </a>
      </span>
    );

    const PermissionLink1 = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("customerRecoverModal")}
        >
          <img
            src={icon_allot + "@1x.png"}
            srcSet={icon_allot + "@2x.png 2x"}
            alt="回收"
          />回收
        </a>
      </span>
    );

    const PermissionLink2 = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("customerAllotModal")}
        >
          <img
            src={icon_reconver + "@1x.png"}
            srcSet={icon_reconver + "@2x.png 2x"}
            alt="分配回访"
          />分配回访
        </a>
      </span>
    );
    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>全部客户</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/customer/pool/get_page"
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
                    className={style.drop_menu}
                    overlay={
                      <Menu onClick={this.handleMenuClick}>
                        <Menu.Item key="all">全部</Menu.Item>
                        <Menu.Item key="unallot">未分配的</Menu.Item>
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
                <div className="vant-filter-bar-action fr">
                  {PermissionButton}
                  {/* <PermissionButton auth="customer.pool.add" /> */}
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
                  <PermissionLink auth="customer.distribution.allot_to_fp" />
                  <PermissionLink1 auth="customer.distribution.recycle" />
                  <PermissionLink2 auth="customer.distribution.allot_to_cs" />
                </div>
              </div>
            </div>
          </GridManager>
          <EditCustomerModal
            reload={this.reload}
            ref={ref => (this.editCustomerModal = ref)}
          />


          <CustomerDeployModal
            reload={this.reload}
            ref={ref => (this.customerDeployModal = ref)}
          />
          <CustomerRecoverModal
            reload={this.reload}
            ref={ref => (this.customerRecoverModal = ref)}
          />
          <CustomerAllotModal
            reload={this.reload}
            ref={ref => (this.customerAllotModal = ref)}
          />
          <ImportCustomerModal
            callback={this.reload}
            ref={ref => (this.importCustomerModal = ref)}
          />
        </div>
        <CustomerDetailFloat
            reload={this.reload}
            ref={ref => (this.editCustomerFloat = ref)}
          />
      </Page>
    );
  }
}
