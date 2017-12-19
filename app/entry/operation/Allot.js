import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Button, Dropdown, Icon, Menu } from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";

import VisitRecordModal from "services/operation/visitRecordModal";
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

export default class OperationAllot extends Base {
  static get NAME() {
    return "OperationAllot";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[OperationAllot.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: { text: "未回访的", value: "todo" },
      filters: {
        dic_sex: [],
        dic_user_visit_type: [],
        dic_user_visit_status: []
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
      .gets("dic_sex,dic_user_visit_type,dic_user_visit_status")
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
    const {
        dic_sex,
        dic_user_visit_type,
        dic_user_visit_status
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
          dataIndex: "customerNumber",
          width: 100,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="customerNumber" mod={this} />
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
          title: "负责人",
          dataIndex: "fpName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="fpName" mod={this} />
            </div>
          )
        },
        {
          title: "回访事由",
          dataIndex: "matter",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="matter" mod={this} />
            </div>
          )
        },
        {
          title: "分配回访时间",
          dataIndex: "subDate",
          width: 140,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="subDate" mod={this} />
              <GridDateFilter filterKey="subDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
          }
        },
        {
          title: "回访方式",
          dataIndex: "types",
          filters: dic_user_visit_type,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="types" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.typeText;
          }
        },
        {
          title: "回访状态",
          dataIndex: "statuss",
          filters: dic_user_visit_status,
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
          title: "回访内容",
          dataIndex: "content",
          width: 200,
          className: "",
          render: (text, record) => {
            return record.content;
          }
        },
        {
          title: "回访负责人",
          dataIndex: "userName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="userName" mod={this} />
            </div>
          )
        },
        {
          title: "回访时间",
          dataIndex: "visitDate",
          width: 140,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="visitDate" mod={this} />
              <GridDateFilter filterKey="visitDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
          }
        },
        {
          title: "操作",
          width: 80,
          fixed: "right",
          render: (text, record) => {
            let content = null;

            if (record.canVisit) {
              content = (
                <div className="operation">
                  <a onClick={() => this.handleModal("allotModal", record)}>
                    回访
                  </a>
                </div>
              );
            } else {
              content = record.isVisitText;
            }
            return content;
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "customerName");
    this.resetFilterByKey(params, "customerNumber");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "sexs");
    this.resetFilterByKey(params, "cityCodes");
    this.resetFilterByKey(params, "fpName");
    this.resetFilterByKey(params, "matter");
    this.resetFilterByKey(params, "subDate");
    this.resetFilterByKey(params, "types");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "userName");
    this.resetFilterByKey(params, "visitDate");

    params.scope = this.state.menuName.value;

    if (params.cityCodes && params.cityCodes.length) {
      params.cityCodes = params.cityCodes.join(",");
    }

    if (params.subDate && params.subDate.length) {
      params.subDateBegin = params.subDate[0];
      params.subDateEnd = params.subDate[1];
      delete params.subDate;
    }
    if (params.visitDate && params.visitDate.length) {
      params.visitDateBegin = params.visitDate[0];
      params.visitDateEnd = params.visitDate[1];
      delete params.visitDate;
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
    let menuName = { text: e.item.props.children, value: e.key };

    this.setState({ menuName }, () => {
      this.reload();
    });
  };
  render() {
    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>回访管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/user/visit/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "180%"
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
                        <Menu.Item key="todo">未回访的</Menu.Item>
                        <Menu.Item key="all">全部回访</Menu.Item>
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
          <VisitRecordModal
            reload={this.reload}
            ref={ref => (this.allotModal = ref)}
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
