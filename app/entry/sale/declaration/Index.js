import React from "react";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Menu,
  Modal,
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

import EnumDeclaration from "enum/enumDeclaration";

import AuditModal from "services/common/auditModal";
import AddDeclarationModal from "services/sale/declaration/addDeclarationModal";
import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";

import Dictionary from "model/dictionary";
import Declaration from "model/Declaration";

import style from "./Index.scss";

const icon_add = "/assets/images/icon/新增";
const icon_question = "/assets/images/icon/问号";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridRangeFilter
} = GM;

const { EnumDeclarationStatus } = EnumDeclaration;

export default class SaleDeclarationIndex extends Base {
  static get NAME() {
    return "SaleDeclarationIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SaleDeclarationIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "我负责的报单",
        value: "my"
      },
      filters: {
        dic_declaration_status: [],
        dic_has_pay_evidence: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.declaration = new Declaration();

    this.getDictionary();

    this.canRefund = Utils.checkPermission("declaration.apply_refund");
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }

  getDictionary() {
    this.dictionary
      .gets("dic_declaration_status,dic_has_pay_evidence")
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
    const { dic_declaration_status, dic_has_pay_evidence } = this.state.filters,
      columns = [
        {
          title: "报单编号",
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
                role="floatPane"
                title={record.title}
                onClick={() => {
                  this.showFloat("declarationDetailFloat", record);
                }}
              >
                {record.number}
              </a>
            );
          }
        },
        {
          title: "来源",
          dataIndex: "aa",
          filters: dic_has_pay_evidence,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="aa" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return "=======";
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
          title: "客户类型",
          dataIndex: "adfsadf",
          filters: dic_has_pay_evidence,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="adfsadf" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return "=======";
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
          title: "打款凭证",
          dataIndex: "hasPayEvidence",
          filters: dic_has_pay_evidence,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="hasPayEvidence" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return text === 1 ? "已上传" : "未上传";
          }
        },
        {
          title: "客户负责人",
          dataIndex: "sdfs",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="sdfs" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return "======";
          }
        },
        {
          title: "报单创建人",
          dataIndex: "safdsf",
          width: 140,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="safdsf" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return "====";
          }
        },
        {
          title: "报单时间",
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
          title: "状态",
          dataIndex: "statuss",
          filters: dic_declaration_status,
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

            if (record.status === EnumDeclarationStatus.enum.PENDING) {
              content = (
                <div>
                  <span>{record.statusName}</span>
                  {popover(`报单待审批`)}
                </div>
              );
            } else if (record.status === EnumDeclarationStatus.enum.PASS) {
              content = <span className="green">{record.statusName}</span>;
            } else if (record.status === EnumDeclarationStatus.enum.REJECT) {
              content = (
                <div>
                  <span className="red">{record.statusName}</span>
                  {popover(`报单已驳回，原因：${record.reason}`)}
                </div>
              );
            } else if (record.status === EnumDeclarationStatus.enum.UNDO) {
              content = (
                <div>
                  <span>{record.statusName}</span>
                  {popover(`报单已取消，原因：${record.reason}`)}
                </div>
              );
            } else if (record.status === EnumDeclarationStatus.enum.INVALID) {
              content = (
                <div>
                  <span>{record.statusName}</span>
                  {popover(`报单已作废，原因：${record.reason}`)}
                </div>
              );
            } else {
              content = record.statusName;
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
            if (record.status === EnumDeclarationStatus.enum.UNCOMMIT) {
              content = (
                <a
                  onClick={() => {
                    this.handleSubmit(record.id);
                  }}
                >
                  提交报单
                </a>
              );
            } else if (record.status === EnumDeclarationStatus.enum.PENDING) {
              content = (
                <a
                  onClick={() => {
                    let data = {
                      id: record.id
                    };
                    this.handleAuditModal("auditCancelModal", data);
                  }}
                >
                  取消报单
                </a>
              );
            } else if (record.status === EnumDeclarationStatus.enum.REJECT) {
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
                    取消报单
                  </a>
                </div>
              );
            } else if (record.status === EnumDeclarationStatus.enum.PASS) {
              content = (
                <div className="operation">
                  {record.canApplyRefund && this.canRefund ? (
                    <a
                      onClick={() => {
                        let data = {
                          id: record.id
                        };
                        this.handleAuditModal("auditRefundsModal", data);
                      }}
                    >
                      申请退款
                    </a>
                  ) : (
                    <Popover
                      placement="topLeft"
                      content={
                        this.canRefund
                          ? record.notCanApplyRefundTitle
                          : "无操作权限"
                      }
                      arrowPointAtCenter
                    >
                      <span className="disabled">申请退款</span>
                    </Popover>
                  )}
                </div>
              );
            } else if (record.status === EnumDeclarationStatus.enum.INVALID) {
              content = (
                <div className="operation">
                  {record.canApplyRefund && this.canRefund ? (
                    <a
                      onClick={() => {
                        let data = {
                          id: record.id
                        };
                        this.handleAuditModal("auditRefundsModal", data);
                      }}
                    >
                      申请退款
                    </a>
                  ) : (
                    <Popover
                      placement="topLeft"
                      content={
                        this.canRefund
                          ? record.notCanApplyRefundTitle
                          : "无操作权限"
                      }
                      arrowPointAtCenter
                    >
                      <span className="disabled">申请退款</span>
                    </Popover>
                  )}
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
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "customerName");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "dealAmount");
    this.resetFilterByKey(params, "payDate");
    this.resetFilterByKey(params, "hasPayEvidence");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "statuss");

    if (params.dealAmount && params.dealAmount.length) {
      params.dealAmountStart = params.dealAmount[0];
      params.dealAmountEnd = params.dealAmount[1];
      delete params.dealAmount;
    }
    if (params.createDate && params.createDate.length) {
      params.createDateStart = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }
    if (params.payDate && params.payDate.length) {
      params.payDateStart = params.payDate[0];
      params.payDateEnd = params.payDate[1];
      delete params.payDate;
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
  reloadGrid = () => {
    this.gridManager.grid.reload();
  };
  handleMenuClick = e => {
    let menuName = {
      text: e.item.props.children,
      value: e.key
    };

    this.setState({ menuName }, () => {
      this.gridManager.grid.reload();
    });
  };
  handleSubmit = id => {
    Modal.confirm({
      width: 380,
      title: "确定提交报单？",
      onOk: () => {
        this.declaration.submit(id).then(res => {
          if (res.success) {
            message.success("提交报单成功");
            this.reloadGrid();
          } else {
            Modal.confirm({
              iconType: "check-circle",
              className: "showfloat",
              title: "资料不完善，请完善后再提交审批",
              content: `待完善资料:${res.message}`,
              cancelText: "关闭",
              okText: "去完善",
              onOk: () => {
                this.showFloat("declarationDetailFloat", {
                  id
                });
                // this.props.history.replace(`/declaration/detail/${id}`);
              }
            });
          }
        });
      }
    });
  };

  /**
   * 取消申请弹窗回调
   *
   */
  handleAuditCallback = (data, auditModal) => {
    const _this = this;

    let postData = this.auditData;
    postData.reason = data.reason;

    this.declaration.cancel(postData).then(res => {
      auditModal.commit(false);
      if (res.success) {
        message.success("操作成功");

        auditModal.hide();

        _this.gridManager.grid.reload();
      }
    });
  };
  /**
   * 申请退款弹窗回调
   *
   */
  handleRefundCallback = (data, auditModal) => {
    const _this = this;

    let postData = this.auditData;
    postData.reason = data.reason;

    this.declaration.refund(postData).then(res => {
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
   * @memberof SaleDeclarationIndex
   */
  handleResubmit = data => {
    const _this = this;
    Modal.confirm({
      title: "请确认报单资料齐全、正确后再提交",
      onOk() {
        return _this.declaration.resubmit(data).then(res => {
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
  render() {
    const PermissionButton = Permission(
      <Button
        className={"btn_add"}
        onClick={() => this.addDeclarationModal.show()}
      >
        <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} />
        新增报单
      </Button>
    );

    const { menuName } = this.state;

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>报单</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/declaration/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "125%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  className={style.drop_menu}
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="my">我负责的报单</Menu.Item>
                      <Menu.Item key="neverfollow">已成交的报单</Menu.Item>
                      <Menu.Item key="focus">我部门的报单</Menu.Item>
                      <Menu.Item key="all">全部报单</Menu.Item>
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
                <PermissionButton auth="sale.declaration.add" />
              </div>
            </div>
          </GridManager>
          <AddDeclarationModal
            reload={this.reloadGrid}
            parent={this}
            ref={ref => (this.addDeclarationModal = ref)}
            history={this.props.history}
          />
          <AuditModal
            title="申请退款"
            labelName="退款原因"
            ref={ref => (this.auditRefundsModal = ref)}
            callback={this.handleRefundCallback}
          />
          <AuditModal
            title="取消报单"
            labelName="取消原因"
            ref={ref => (this.auditCancelModal = ref)}
            callback={this.handleAuditCallback}
          />
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
