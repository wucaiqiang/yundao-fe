import React from "react";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Input,
  Menu,
  Modal,
  Table,
  Tooltip,
  Popover,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";

import GM from "lib/gridManager";
import extend from "extend";
import Utils from "utils/";

import EnumAppointment from "enum/enumAppointment";

import AuditModal from "services/common/auditModal";
import EditAppointmentModal from "services/sale/appointment/editAppointmentModal";
import AuditRecordModal from "services/sale/appointment/auditRecordModal";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import Appoint from "model/Appoint";

import Dictionary from "model/dictionary";

import style from "./Index.scss";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridRangeFilter
} = GM;

const { EnumAppointmentStatus } = EnumAppointment;

export default class SaleAppointmentAudit extends Base {
  static get NAME() {
    return "SaleAppointmentAudit";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SaleAppointmentAudit.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      filters: {},
      menuName: { text: "未处理的申请", value: "unprocess" }
    };
  }
  componentWillMount() {
    this.appoint = new Appoint();
    this.dictionary = new Dictionary();

    this.getDictionary();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  getDictionary() {
    this.dictionary.gets("dic_reservation_audit_status").then(res => {
      if (res.success && res.result) {
        let filters = {};
        res.result.map(item => {
          filters[item.value] = item.selections;
        });

        this.setState({ filters });
      }
    });
  }
  showFloat = (float, ...args) => {
    const current = this.state.currentFloat;
    if (current && current != float) {
      this[current].hide();
    }
    this.setState({
      currentFloat: float
    });
    this[float].show(...args);
  };
  getColumns = () => {
    const { dic_reservation_audit_status } = this.state.filters;
    const columns = [
      {
        title: "预约编号",
        dataIndex: "number",
        fixed: "left",
        width: 100,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="number" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              title={record.title}
              onClick={() => {
                this.editAppointmentModal.show(record, false);
              }}
            >
              {record.number}
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
                this.showFloat("productDetailFloat", { id: record.productId });
              }}
            >
              {record.productName}
            </a>
          );
        }
      },
      {
        title: "募集进度",
        render: (text, record) => {
          let reservation = record.reservationSumAmount || 0,
            declaration = record.declarationSumAmount || 0,
            content = `预约${reservation}万/报单${declaration}万`;
          return (
            <Popover placement="top" content={content}>
              <span>
                {reservation}万/{declaration}万
              </span>
            </Popover>
          );
        }
      },
      {
        title: "预约金额",
        dataIndex: "reservationAmount",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="reservationAmount" mod={this} />
            <GridRangeFilter filterKey="reservationAmount" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return `${record.reservationAmount}万`;
        }
      },
      {
        title: "预计打款日期",
        dataIndex: "estimatePayDate",
        width: 130,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="estimatePayDate" mod={this} />
            <GridDateFilter filterKey="estimatePayDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "申请时间",
        dataIndex: "commitDate",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="commitDate" mod={this} />
            <GridDateFilter filterKey="commitDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "申请人",
        dataIndex: "reservationor",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="reservationor" mod={this} />
          </div>
        )
      },
      {
        title: "操作时间",
        dataIndex: "operationDate",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="operationDate" mod={this} />
            <GridDateFilter filterKey="operationDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "审批结果",
        dataIndex: "statuss",
        width: 140,
        filters: dic_reservation_audit_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="statuss" mod={this} />
          </div>
        ),
        render: (text, record) => {
          let content = null;
          if (record.status === EnumAppointmentStatus.enum.PASS) {
            content = (
              <span className=" status green">{record.statusText}</span>
            );
          } else if (record.status === EnumAppointmentStatus.enum.REJECT) {
            content = <span className="status red">{record.statusText}</span>;
          } else {
            content = <span className="status">{record.statusText}</span>;
          }

          return content;
        }
      },
      {
        title: "操作",
        width: 180,
        fixed: "right",
        render: (text, record) => {
          let content = null;
          if (record.status === EnumAppointmentStatus.enum.PENDING) {
            content = record.canAudit ? (
              <span>
                <a
                  onClick={() =>
                    this.handlePassModal({
                      id: record.id,
                      action: 1
                    })
                  }
                >
                  通过
                </a>
                <a
                  onClick={() => {
                    let data = {
                      id: record.id,
                      action: 2
                    };
                    this.handleAuditModal("auditRejectModal", data);
                  }}
                >
                  驳回
                </a>
              </span>
            ) : null;
          }
          return (
            <div className="operation">
              {content}
              <a
                onClick={() => {
                  this.auditRecordModal.show(record);
                }}
              >
                审批记录
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
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "customerName");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "reservationAmount");
    this.resetFilterByKey(params, "estimatePayDate");
    this.resetFilterByKey(params, "commitDate");
    this.resetFilterByKey(params, "reservationor");
    this.resetFilterByKey(params, "operationDate");
    this.resetFilterByKey(params, "statuss");

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }

    if (params.reservationAmount && params.reservationAmount.length) {
      params.reservationAmountBegin = params.reservationAmount[0];
      params.reservationAmountEnd = params.reservationAmount[1];
      delete params.reservationAmount;
    }

    if (params.estimatePayDate && params.estimatePayDate.length) {
      params.estimatePayDateBegin = params.estimatePayDate[0];
      params.estimatePayDateEnd = params.estimatePayDate[1];
      delete params.estimatePayDate;
    }
    if (params.commitDate && params.commitDate.length) {
      params.commitDateBegin = params.commitDate[0];
      params.commitDateEnd = params.commitDate[1];
      delete params.commitDate;
    }

    if (params.operationDate && params.operationDate.length) {
      params.operationDateBegin = params.operationDate[0];
      params.operationDateEnd = params.operationDate[1];
      delete params.operationDate;
    }

    params.scope = this.state.menuName.value;

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

  reloadGrid = () => {
    this.gridManager.grid.reload();
  };
  handleMenuClick = e => {
    let menuName = { text: e.item.props.children, value: e.key };

    this.setState({ menuName }, () => {
      // this.gridManager.grid.load();
      this.gridManager.grid.reload();
    });
  };
  /**
   * 驳回/取消弹窗回调
   *
   */
  handleAuditCallback = (data, auditModal) => {
    const _this = this;

    let postData = this.auditData;
    postData.reason = data.reason;

    this.appoint.audit(postData).then(res => {
      auditModal.commit(false);
      if (res.success) {
        message.success("操作成功");

        auditModal.hide();

        _this.gridManager.grid.reload();
      }
    });
  };
  handleAuditModal = (modal, data) => {
    this.auditData = data;
    this[modal].show();
  };
  handlePassModal = data => {
    const _this = this;
    Modal.confirm({
      title: "请确认预约信息无误后点击确定",
      onOk() {
        return _this.appoint.audit(data).then(res => {
          if (res.success) {
            message.success("操作成功");

            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };
  render() {
    let { menuName } = this.state;

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>预约额度审批</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/reservation/audit/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{ x: "150%" }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="unprocess">未处理的申请</Menu.Item>
                      <Menu.Item key="all">全部申请</Menu.Item>
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
          </GridManager>

          <AuditModal
            title="驳回预约"
            ref={ref => (this.auditRejectModal = ref)}
            callback={this.handleAuditCallback}
          />
          <AuditModal
            title="取消预约"
            labelName="取消原因"
            ref={ref => (this.auditCancelModal = ref)}
            callback={this.handleAuditCallback}
          />
          <AuditRecordModal
            ref={ref => (this.auditRecordModal = ref)}
            reload={this.reloadGrid}
          />
        </div>
        <EditAppointmentModal
          reload={this.reloadGrid}
          ref={ref => (this.editAppointmentModal = ref)}
        />
        <CustomerDetailFloat
          reload={this.reloadGrid}
          ref={ref => (this.customerDetailFloat = ref)}
        />
        <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
      </Page>
    );
  }
}
