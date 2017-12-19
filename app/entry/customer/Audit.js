import React from "react";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Button,
  Icon,
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
import EnumCustomer from "enum/enumCustomer";

import AuditModal from "services/common/auditModal";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

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

const { EnumAuditStatus } = EnumCustomer;

export default class CustomerAudit extends Base {
  static get NAME() {
    return "CustomerAudit";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[CustomerAudit.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      noticeTypes: [],
      filters: {
        dic_sex: [],
        dic_customer_level: []
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
    this.dictionary.gets("dic_sex,dic_customer_level").then(res => {
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
    const { dic_sex, dic_customer_level } = this.state.filters,
      columns = [
        {
          title: "客户名称",
          dataIndex: "customerName",
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
                  this.editCustomerFloat.show({
                    id: record.customerId,
                    open_source: "customer_audit"
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
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="customerNumber" mod={this} />
            </div>
          )
        },
        {
          title: "手机号码",
          dataIndex: "customerMobile",
          width: 120,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter
                filterKey="customerMobile"
                mod={this}
                placeholder="请输入正确手机号"
              />
            </div>
          )
        },
        {
          title: "性别",
          dataIndex: "customerSexs",
          width: 80,
          filters: dic_sex,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="customerSexs" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.customerSexText;
          }
        },
        {
          title: "地域",
          dataIndex: "cityCodes",
          filters: this.state.noticeTypes,
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
          dataIndex: "customerLevels",
          width: 100,
          sort: true,
          filters: dic_customer_level,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="customerLevels" mod={this} />
              <GridCheckboxFilter filterKey="customerLevels" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.customerLevelText;
          }
        },
        {
          title: "申请发起人",
          dataIndex: "applyUserName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="applyUserName" mod={this} />
            </div>
          )
        },
        {
          title: "放弃原因",
          dataIndex: "reason",
          width: 200,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="reason" mod={this} />
            </div>
          )
        },
        {
          title: "申请日期",
          dataIndex: "applyDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="applyDate" mod={this} />
              <GridDateFilter filterKey="applyDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "审批日期",
          dataIndex: "examineDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="examineDate" mod={this} />
              <GridDateFilter filterKey="examineDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "审批",
          width: 150,
          fixed: "right",
          render: (text, record) => {
            let content = null;
            if (record.status === EnumAuditStatus.enum.REVIEW) {
              content = (
                <div className="operation">
                  <a
                    onClick={() =>
                      this.handleAudit({
                        id: record.id
                      })
                    }
                  >
                    通过
                  </a>
                  <a onClick={() => this.handleAuditModal(record)}>驳回</a>
                </div>
              );
            } else if (record.status === EnumAuditStatus.enum.REJECT) {
              content = (
                <Popover
                  placement="topLeft"
                  content={record.rejectReason}
                  arrowPointAtCenter
                >
                  {record.statusText}
                </Popover>
              );
            } else {
              content = record.statusText;
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
    this.resetFilterByKey(params, "customerMobile");
    this.resetFilterByKey(params, "customerNumber");
    this.resetFilterByKey(params, "customerSexs");
    this.resetFilterByKey(params, "cityCodes");
    this.resetFilterByKey(params, "customerLevels");
    this.resetFilterByKey(params, "applyUserName");
    this.resetFilterByKey(params, "reason");
    this.resetFilterByKey(params, "applyDate");
    this.resetFilterByKey(params, "examineDate");

    if (params.cityCodes && params.cityCodes.length) {
      params.cityCodes = params.cityCodes.join(",");
    }

    if (params.applyDate && params.applyDate.length) {
      params.applyStartDate = params.applyDate[0];
      params.applyEndDate = params.applyDate[1];
      delete params.applyDate;
    }
    if (params.examineDate && params.examineDate.length) {
      params.examineStartDate = params.examineDate[0];
      params.examineEndDate = params.examineDate[1];
      delete params.examineDate;
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
  /**
   *
   * 回退通过
   *
   * @memberof CustomerAudit
   */
  handleAudit = (data, origin) => {
    const _this = this;
    //true:审批通过,false:驳回
    data.isPass = data.reason ? false : true;

    this.customer.audit(data).then(res => {
      origin.commit(false);

      if (res.success) {
        message.success(data.reason ? "驳回成功" : "审批通过成功");

        origin.hide();
        _this.gridManager.grid.reload();
      }
    });
  };
  /**
   * 回退驳回弹窗回调
   *
   * @memberof ProductControlAudit
   */
  handleAuditReject = (data, origin) => {
    const _this = this;

    data.id = this.auditId;

    this.handleAudit(data, origin);
  };
  handleAuditModal = data => {
    this.auditId = data.id;
    this.auditModal.show();
  };
  render() {
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>回退客户审批</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/customer/back/gets"
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
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
            </div>
          </GridManager>

          <AuditModal
            ref={ref => (this.auditModal = ref)}
            callback={this.handleAuditReject}
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
