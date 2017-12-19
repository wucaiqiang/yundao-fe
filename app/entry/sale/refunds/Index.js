import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Button, Modal, message, Popover } from "antd";

import GM from "lib/gridManager";
import Utils from "utils/";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import AuditModal from "services/common/auditModal";

import Dictionary from "model/dictionary";
import Refund from "model/Refund/";

import EnumRefund from "enum/enumRefund";

import style from "./Index.scss";

const { EnumRefundStatus } = EnumRefund;

const icon_add = "/assets/images/icon/新增";
const icon_question = "/assets/images/icon/问号";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridRangeFilter,
  GridCheckboxFilter
} = GM;

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
      filters: {
        dic_refund_status: []
      }
    };
  }
  componentWillMount() {
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
    this.setState({ currentFloat: float });
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

  /**
   * 驳回/取消弹窗回调
   *
   */
  handleAuditCallback = (data, auditModal) => {
    const _this = this;

    let postData = this.auditData;
    postData.reason = data.reason;

    this.refund.cancel(postData).then(res => {
      auditModal.commit(false);
      if (res.success) {
        message.success("操作成功");

        auditModal.hide();

        _this.gridManager.grid.reload();
      }
    });
  };

  /**
   * 重新提交
   *
   */
  handleResubmit = data => {
    const _this = this;
    Modal.confirm({
      title: "确定重新提交退款申请",
      onOk() {
        return _this.refund.resubmit(data).then(res => {
          if (res.success) {
            message.success("重新提交成功");

            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };
  handleAuditModal = (modal, data) => {
    this.auditData = data;
    this[modal].show();
  };

  getColumns = () => {
    const { dic_refund_status } = this.state.filters;
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
        title: "报单时间",
        dataIndex: "declarationDate",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="declarationDate" mod={this} />
            <GridDateFilter filterKey="declarationDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
        }
      },
      {
        title: "退款原因",
        dataIndex: "reason"
      },
      {
        title: "状态",
        dataIndex: "statuss",
        filters: dic_refund_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="statuss" mod={this} />
          </div>
        ),
        render: (text, record) => {
          let content = null;

          let popover = text => (
            <Popover placement="topLeft" content={text} arrowPointAtCenter>
              <img
                src={icon_question + "@1x.png"}
                srcSet={icon_question + "@2x.png 2x"}
              />
            </Popover>
          );

          if (record.status === EnumRefundStatus.enum.PENDING) {
            content = (
              <div>
                <span>{record.statusText}</span>
                {popover(`退款待审批`)}
              </div>
            );
          } else if (record.status === EnumRefundStatus.enum.PASS) {
            content = <span className="green">{record.statusText}</span>;
          } else if (record.status === EnumRefundStatus.enum.REJECT) {
            content = (
              <div>
                <span className="red">{record.statusText}</span>
                {popover(`退款已驳回，原因：${record.auditReason}`)}
              </div>
            );
          } else if (record.status === EnumRefundStatus.enum.UNDO) {
            content = (
              <div>
                <span>{record.statusText}</span>
                {popover(`退款已取消，原因：${record.auditReason}`)}
              </div>
            );
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
            content = (
              <a
                onClick={() => {
                  let data = {
                    id: record.id
                  };
                  this.handleAuditModal("auditCancelModal", data);
                }}
              >
                取消申请
              </a>
            );
          } else if (record.status === EnumRefundStatus.enum.REJECT) {
            content = (
              <div className="operation">
                <a
                  onClick={() =>
                    this.handleResubmit({
                      id: record.id
                    })
                  }
                >
                  重新提交
                </a>
                <a
                  onClick={() => {
                    let data = {
                      id: record.id
                    };
                    this.handleAuditModal("auditCancelModal", data);
                  }}
                >
                  取消申请
                </a>
              </div>
            );
          }
          return content;
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
    this.resetFilterByKey(params, "declarationDate");
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
    if (params.declarationDate && params.declarationDate.length) {
      params.declarationDateStart = params.declarationDate[0];
      params.declarationDateEnd = params.declarationDate[1];
      delete params.declarationDate;
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

  reload() {
    this.gridManager.grid.reload();
  }

  handleAdd = () => {
    Modal.confirm({
      title: "您可到报单中，对审批通过的报单申请退款",
      okText: "去报单列表",
      onOk: () => {
        this.props.history.push("/sale/declaration");
      }
    });
  };
  render() {
    const PermissionButton = Permission(
      <Button className={"btn_add"} onClick={this.handleAdd}>
        <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} />
        申请退款
      </Button>
    );

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>我的退款</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/refund/get_my_refund_page"
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
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                <PermissionButton auth="declaration.apply_refund" />
              </div>
            </div>
          </GridManager>

          <AuditModal
            title="取消申请"
            labelName="取消原因"
            ref={ref => (this.auditCancelModal = ref)}
            callback={this.handleAuditCallback}
          />
        </div>
        <DeclarationDetailFloat
          reload={this.reload}
          ref={ref => (this.declarationDetailFloat = ref)}
        />
        <CustomerDetailFloat
          reload={this.reload}
          ref={ref => (this.customerDetailFloat = ref)}
        />
        <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
      </Page>
    );
  }
}
