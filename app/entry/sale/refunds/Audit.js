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
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";

import style from "./Index.scss";

const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";

import Dictionary from "model/dictionary";
import Refund from "model/Refund/";

import EnumRefund from "enum/enumRefund";

import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import AuditModal from "services/common/auditModal";
import AuditRecordModal from "services/sale/refund/auditRecordModal";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridRangeFilter,
  GridCheckboxFilter
} = GM;

const { EnumRefundStatus } = EnumRefund;

export default class SaleRefundsIndex extends Base {
  static get NAME() {
    return "SaleRefundsIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SaleRefundsIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: { text: "未处理的", value: "unprocess" },
      filters: {
        dic_refund_status: []
      }
    };
  }
  componentWillMount() {
    this.getColumns();
    this.dictionary = new Dictionary();
    this.refund = new Refund();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
    this.getDictionary();
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
    this.dictionary.gets("dic_refund_status").then(res => {
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
    const { dic_refund_status } = this.state.filters;

    const PermissionButton = record => {
      return Permission(
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
      );
    };
    const columns = [
      {
        title: "报单编号",
        dataIndex: "declarationNumber",
        width: 100,
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="declarationNumber" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              role="floatPane"
              onClick={() => {
                this.showFloat("declarationDetailFloat", {
                  id: record.declarationId
                });
              }}
            >
              {record.declarationNumber}
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
          return `${record.dealAmount}万`;
        }
      },
      {
        title: "打款日期",
        dataIndex: "payDate",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="payDate" mod={this} />
            <GridDateFilter filterKey="payDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "申请时间",
        dataIndex: "applyDate",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="applyDate" mod={this} />
            <GridDateFilter filterKey="applyDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "申请人",
        dataIndex: "applyUserName",
        width: 140,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="applyUserName" mod={this} />
          </div>
        )
      },
      {
        title: "退款原因",
        render: (text, record) => {
          return record.reason;
        }
      },
      {
        title: "操作时间",
        dataIndex: "auditDate",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="auditDate" mod={this} />
            <GridDateFilter filterKey="auditDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "审批结果",
        dataIndex: "statuss",
        sorter: true,
        filters: dic_refund_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="statuss" mod={this} />
          </div>
        ),
        render: (text, record) => {
          let content = null;
          if (record.status === EnumRefundStatus.enum.PASS) {
            content = <span className="status green">{record.statusText}</span>;
          } else if (record.status === EnumRefundStatus.enum.REJECT) {
            content = <span className="status red">{record.statusText}</span>;
          } else {
            content = <span className="status">{record.statusText}</span>;
          }
          return content;
        }
      },
      {
        title: "操作",
        width: 150,
        fixed: "right",
        render: (text, record) => {
          let content = null;
          if (record.status === EnumRefundStatus.enum.PENDING) {
            const Button = PermissionButton(record);
            content = <Button auth="refund.audit.do" />;
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
    this.resetFilterByKey(params, "declarationNumber");
    this.resetFilterByKey(params, "customerName");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "dealAmount");
    this.resetFilterByKey(params, "payDate");
    this.resetFilterByKey(params, "applyDate");
    this.resetFilterByKey(params, "applyUserName");
    this.resetFilterByKey(params, "auditDate");
    this.resetFilterByKey(params, "statuss");

    if (params.dealAmount && params.dealAmount.length) {
      params.dealAmountStart = params.dealAmount[0];
      params.dealAmountEnd = params.dealAmount[1];
      delete params.dealAmount;
    }
    if (params.payDate && params.payDate.length) {
      params.payDateStart = params.payDate[0];
      params.payDateEnd = params.payDate[1];
      delete params.payDate;
    }
    if (params.applyDate && params.applyDate.length) {
      params.applyDateStart = params.applyDate[0];
      params.applyDateEnd = params.applyDate[1];
      delete params.applyDate;
    }
    if (params.auditDate && params.auditDate.length) {
      params.auditDateStart = params.auditDate[0];
      params.auditDateEnd = params.auditDate[1];
      delete params.auditDate;
    }

    params.scope = this.state.menuName.value;

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
  reloadGrid() {
    this.gridManager.grid.reload();
  }
  handleMenuClick = e => {
    let menuName = { text: e.item.props.children, value: e.key };

    this.setState({ menuName }, () => {
      this.gridManager.grid.reload();
    });
  };
  /**
   * 驳回弹窗回调
   *
   */
  handleAuditCallback = (data, auditModal) => {
    const _this = this;

    let postData = this.auditData;
    postData.reason = data.reason;

    this.refund.audit(postData).then(res => {
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
      title: "确定审批通过报单的退款申请？",
      onOk() {
        return _this.refund.audit(data).then(res => {
          if (res.success) {
            message.success("操作成功");

            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };

  render() {
    const { menuName } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>退款审批</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/refund/audit/get_audit_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="unprocess">未处理的</Menu.Item>
                      <Menu.Item key="all">全部</Menu.Item>
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
            title="驳回退款申请"
            labelName="驳回原因"
            ref={ref => (this.auditRejectModal = ref)}
            callback={this.handleAuditCallback}
          />
          <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
        </div>
        <DeclarationDetailFloat
          reload={this.reloadGrid}
          ref={ref => (this.declarationDetailFloat = ref)}
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
