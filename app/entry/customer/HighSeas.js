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
  Modal,
  Select,
  Tooltip,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";

import EditCustomerModal from "services/customer/editCustomerModal";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";
import ImportCustomerModal from "services/customer/import/importCustomerModal";
import FilterCustomerForm from "services/customer/filterCustomerForm";

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

export default class CustomerHighSeas extends Base {
  static get NAME() {
    return "CustomerHighSeas";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[CustomerHighSeas.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      filters: {
        dic_sex: [],
        dic_customer_level: [],
        dic_yes_or_no: [],
        dic_customer_status: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.customer = new Customer();

    this.getDictionary();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  getDictionary() {
    this.dictionary
      .gets("dic_sex,dic_customer_level,dic_yes_or_no,dic_customer_status")
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
    const PermissionButton = record => {
      return Permission(
        <div className="operation">
          <a onClick={() => this.handleReceive(record.id)}>领取</a>
        </div>,
        <Popover placement="topRight" content={"无权限操作"} arrowPointAtCenter>
          <span className="disabled">领取</span>
        </Popover>
      );
    };

    const {
        dic_sex,
        dic_customer_level,
        dic_yes_or_no,
        dic_customer_status
      } = this.state.filters,
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
                  record.open_source = "customer_opensea";
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
          sorter: true,
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
          title: "客户状态",
          dataIndex: "statuss",
          filters: dic_customer_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="statuss" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.statusText;
          }
        },
        {
          title: "是否成交",
          dataIndex: "isDeals",
          width: 90,
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
        },
        {
          title: "操作",
          width: 80,
          fixed: "right",
          render: (text, record) => {
            const CurrentButton = PermissionButton(record);
            return <CurrentButton auth="customer.opensea.receive_customer" />;
          }
        }
      ];

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
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "isDeals");
    this.resetFilterByKey(params, "dealDate");
    this.resetFilterByKey(params, "createDate");

    this.resetFilterByKey(params, "tags");
    this.resetFilterByKey(params, "investTypes");
    this.resetFilterByKey(params, "riskRatings");
    this.resetFilterByKey(params, "typies");
    this.resetFilterByKey(params, "birthday");

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

    if (params.birthday && params.birthday.length) {
      params.birthdayBegin = params.birthday[0];
      params.birthdayEnd = params.birthday[1];
      delete params.birthday;
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
        } else if (key === "birthday") {
          params[key] = params[key][0].values.splice(2);
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
  handleReceive = customerId => {
    this.customer.receive(customerId).then(res => {
      if (res.success) {
        Modal.success({
          title: "领取成功！",
          content: "请及时跟进客户，转化出单",
          okText: "关闭"
        });

        this.gridManager.grid.reload();
      }
    });
  };
  render() {
    const hasAdd = Utils.checkPermission("customer.add_opensea");
    const hasImport = Utils.checkPermission(
      "customer.import.multi_from_opensea"
    );

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
                          request: "/api/customer/import/multi_from_opensea"
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
                  this.editCustomerModal.show({ origin: "hignseas" });
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
                  this.editCustomerModal.show({ origin: "hignseas" });
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
                  request: "/api/customer/import/multi_from_opensea"
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

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>客户公海</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/customer/opensea/get_page"
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
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-action fr">
                {PermissionButton}
              </div>
            </div>
            <FilterBar gridManager={this.gridManager} ref="filterBar">
              <FilterCustomerForm grid={this.gridManager} />
            </FilterBar>
          </GridManager>
          <EditCustomerModal
            reload={this.reload}
            ref={ref => (this.editCustomerModal = ref)}
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
