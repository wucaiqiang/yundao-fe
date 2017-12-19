import React from "react";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Popover,
  Icon,
  Menu,
  message,
  Modal
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";

import EnumKnotCommission from "enum/EnumKnotCommission";

import Dictionary from "model/dictionary";

import VisitViewModal from "services/operation/visitViewModal";

import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import AuditModal from "services/common/auditModal";
import AuditRecordModal from "services/finance/commission/auditRecordModal";

import Commission from "model/Finance/commission";

import style from "./Index.scss";

const icon_question = "/assets/images/icon/问号";

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

const {
  EnumKnotCommissionStatus,
  EnumKnotCommissionAction
} = EnumKnotCommission;

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
        dic_knotcommission_type: [],
        dic_knotcommission_status: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.commission = new Commission();
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
      .gets("dic_knotcommission_type,dic_knotcommission_status")
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

  handlePassModal = data => {
    const _this = this;

    Modal.confirm({
      width: 420,
      title: "请确定结佣信息无误后通过审批?",
      onOk() {
        _this.commission.flow(data).then(res => {
          if (res.success) {
            message.success("操作成功");

            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };
  /**
   * 否决弹窗回调
   *
   * @memberof ProductControlAudit
   */
  handleAuditReject = (data, auditModal) => {
    data.id = this.auditId;
    data.action = EnumKnotCommissionAction.enum.UNDO;

    const _this = this;
    this.commission.flow(data).then(res => {
      auditModal.commit(false);
      if (res.success) {
        message.success("操作成功");

        auditModal.hide();
        _this.gridManager.grid.reload();
      }
    });
  };

  handleAuditModal = data => {
    this.auditId = data.id;
    this.auditModal.show();
  };

  getColumns = () => {
    const PermissionButton = record => {
      return Permission(
        <span>
          <a
            onClick={() =>
              this.handlePassModal({
                id: record.id,
                action: EnumKnotCommissionAction.enum.PASS
              })
            }
          >
            通过
          </a>
          <a onClick={() => this.handleAuditModal(record)}>否决</a>
        </span>
      );
    };
    const {
        dic_leads_type,
        dic_leads_channel,
        dic_leads_status,
        dic_customer_status,
        dic_knotcommission_type,
        dic_knotcommission_status
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
                  this.showFloat("declarationDetailFloat", {
                    id: record.declarationId
                  });
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
          dataIndex: "decOperationDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="decOperationDate" mod={this} />
              <GridDateFilter filterKey="decOperationDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(record.decOperationDate, "YYYY-MM-DD");
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
          title: "申请时间",
          dataIndex: "applyDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="applyDate" mod={this} />
              <GridDateFilter filterKey="applyDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(record.applyDate, "YYYY-MM-DD");
          }
        },
        {
          title: "申请人",
          dataIndex: "applyUserName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="applyUserName" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.applyUserName;
          }
        },
        {
          title: "佣金类型",
          dataIndex: "type",
          filters: dic_knotcommission_type,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="type" mod={this} />
            </div>
          ),
          render: (text, record) => {
            let content = "";
            if (dic_knotcommission_type) {
              content = dic_knotcommission_type.filter(
                item => item.value == record.type
              ).length
                ? dic_knotcommission_type.filter(
                    item => item.value == record.type
                  )[0].label
                : "";
            }
            return content;
          }
        },
        {
          title: "佣金费率",
          dataIndex: "rate",
          render: (text, record) => {
            return `${record.rate || 0}%`;
          }
        },
        {
          title: "发放金额",
          dataIndex: "amount",
          render: (text, record) => {
            return `${record.amount}元`;
          }
        },
        {
          title: "备注",
          dataIndex: "remark"
        },
        {
          title: "操作时间",
          dataIndex: "operationDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="operationDate" mod={this} />
              <GridDateFilter filterKey="operationDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(record.operationDate, "YYYY-MM-DD");
          }
        },
        {
          title: "审批结果",
          dataIndex: "status",
          filters: dic_knotcommission_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="status" mod={this} />
            </div>
          ),
          render: (text, record) => {
            const { status, auditReason } = record;
            let statusText = null;
            let content = null;
            let popover = text => (
              <Popover placement="topLeft" content={text} arrowPointAtCenter>
                <img
                  src={icon_question + "@1x.png"}
                  srcSet={icon_question + "@2x.png 2x"}
                />
              </Popover>
            );
            if (dic_knotcommission_status) {
              statusText = dic_knotcommission_status.filter(
                item => item.value == record.status
              ).length
                ? dic_knotcommission_status.filter(
                    item => item.value == record.status
                  )[0].label
                : "";
            }
            if (status == EnumKnotCommissionStatus.enum.UNDO) {
              content = (
                <div>
                  <span className="red">{statusText}</span>
                  {popover(`结佣已否决，原因：${auditReason}`)}
                </div>
              );
            } else {
              content = statusText;
            }
            return content;
          }
        },

        {
          title: "操作",
          width: 150,
          fixed: "right",
          render: (text, record) => {
            if (record.status === EnumKnotCommissionStatus.enum.PENDING) {
              const Button = PermissionButton(record);
              return (
                <div className={style.operation}>
                  <Button auth="knot.commission.audit" />
                  <a
                    onClick={() => {
                      this.auditRecordModal.show(record);
                    }}
                  >
                    审批记录
                  </a>
                </div>
              );
            } else {
              return (
                <a
                  onClick={() => {
                    this.auditRecordModal.show(record);
                  }}
                >
                  审批记录
                </a>
              );
            }
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "customerName");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "dealAmount");
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "decOperationDate");
    this.resetFilterByKey(params, "userName");
    this.resetFilterByKey(params, "applyDate");
    this.resetFilterByKey(params, "applyUserName");
    this.resetFilterByKey(params, "type");
    this.resetFilterByKey(params, "operationDate");
    this.resetFilterByKey(params, "status");

    if (params.dealAmount && params.dealAmount.length) {
      params.dealAmountBegin = params.dealAmount[0];
      params.dealAmountEnd = params.dealAmount[1];
      delete params.dealAmount;
    }
    if (params.decOperationDate && params.decOperationDate.length) {
      params.decOperationBeginDate = params.decOperationDate[0];
      params.decOperationEndDate = params.decOperationDate[1];
      delete params.decOperationDate;
    }

    if (params.applyDate && params.applyDate.length) {
      params.applyBeginDate = params.applyDate[0];
      params.applyEndDate = params.applyDate[1];
      delete params.applyDate;
    }

    if (params.operationDate && params.operationDate.length) {
      params.operationBeginDate = params.operationDate[0];
      params.operationEndDate = params.operationDate[1];
      delete params.operationDate;
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
          <Breadcrumb.Item>结佣审批</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/knot/commission/gets_audit"
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
                <div className="fl">
                  <FilterBar gridManager={this.gridManager} ref="filterBar" />
                </div>
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
          <AuditModal
            labelName={"否决原因"}
            title={"否决申请"}
            ref={ref => (this.auditModal = ref)}
            callback={this.handleAuditReject}
          />
          <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
        </div>
      </Page>
    );
  }
}
