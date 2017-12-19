import React from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import { Breadcrumb, Modal, Button, Dropdown, Icon, Menu, message } from "antd";
import ClassNames from "classnames";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import Receipt from "model/Finance/receipt";

import GM from "lib/gridManager";
import Utils from "utils/";

import AddPlanModal from "services/finance/receiptplan/addPlanModal";
import AddCashModal from "services/finance/receiptplan/addCashModal";
import FloatPanel from "services/finance/receiptplan/detail/FloatPanel";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridRangeFilter
} = GM;

const icon_add = "/assets/images/icon/新增";

function formatMoney(value) {
  return `${value}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default class ReceiptPlanIndex extends Base {
  static get NAME() {
    return "ReceiptPlanIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ReceiptPlanIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "全部",
        value: "all"
      }
    };
  }
  componentWillMount() {}
  componentDidMount() {
    this.receipt = new Receipt();

    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  getColumns = () => {
    const columns = [
      {
        title: "回款计划名称",
        dataIndex: "name",
        width: 200,
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
                this.handleModal("floatPanel", {
                  id: record.id
                });
              }}
            >
              {record.name}
            </a>
          );
        }
      },
      {
        title: "回款产品",
        dataIndex: "productName",
        width: 200,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="productName" mod={this} />
          </div>
        )
      },
      {
        title: "关联交易",
        dataIndex: "declarationCount",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="declarationCount" mod={this} />
            <GridRangeFilter filterKey="declarationCount" mod={this} />
          </div>
        )
      },
      {
        title: "计划回款金额",
        dataIndex: "amount",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="amount" mod={this} />
            <GridRangeFilter filterKey="amount" mod={this} />
          </div>
        ),
        render: formatMoney
      },
      {
        title: "回款次数",
        dataIndex: "receiptCount",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="receiptCount" mod={this} />
            <GridRangeFilter filterKey="receiptCount" mod={this} />
          </div>
        )
      },
      {
        title: "实际回款金额",
        dataIndex: "actualReceiptAmount",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="actualReceiptAmount" mod={this} />
            <GridRangeFilter filterKey="actualReceiptAmount" mod={this} />
          </div>
        ),
        render: formatMoney
      },
      {
        title: "创建日期",
        dataIndex: "createDate",
        width: 120,
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
        width: 100,
        fixed: "right",
        render: (text, record) => {
          return (
            <div className="operation">
              <a onClick={() => this.handleModal("addCashModal", record)}>
                录入回款
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
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "declarationCount");
    this.resetFilterByKey(params, "amount");
    this.resetFilterByKey(params, "receiptCount");
    this.resetFilterByKey(params, "actualReceiptAmount");
    this.resetFilterByKey(params, "createDate");

    params.scope = this.state.menuName.value;

    if (params.declarationCount && params.declarationCount.length) {
      params.declarationCountBegin = params.declarationCount[0];
      params.declarationCountEnd = params.declarationCount[1];
      delete params.declarationCount;
    }
    if (params.amount && params.amount.length) {
      params.amountBegin = params.amount[0];
      params.amountEnd = params.amount[1];
      delete params.amount;
    }
    if (params.receiptCount && params.receiptCount.length) {
      params.receiptCountBegin = params.receiptCount[0];
      params.receiptCountEnd = params.receiptCount[1];
      delete params.receiptCount;
    }
    if (params.actualReceiptAmount && params.actualReceiptAmount.length) {
      params.actualReceiptAmountBegin = params.actualReceiptAmount[0];
      params.actualReceiptAmountEnd = params.actualReceiptAmount[1];
      delete params.actualReceiptAmount;
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
  handleSelect(selectData) {
    let { selectIds, selectRowsCount = 0, selectRowsData } = selectData;
    this.setState({ selectIds, selectRowsCount, selectRowsData });
  }
  handleRemove = () => {
    let { selectIds } = this.state,
      _this = this;

    Modal.confirm({
      width: 420,
      title: "确定删除选中回款计划?",
      onOk() {
        return _this.receipt.delete(selectIds).then(res => {
          const { failList = [], passList = [] } = res.result || {};
          if (failList && failList.length) {
            let successIds = [],
              messageContent = [],
              messages = {};

            passList.map(item => {
              successIds.push(item.id);
            });

            //汇总错误信息
            failList.map(item => {
              if (!messages[item.code]) {
                messages[item.code] = {
                  message: item.message,
                  name: [item.name]
                };
              } else {
                messages[item.code].name.push(item.name);
              }
            });

            for (var key in messages) {
              if (messages.hasOwnProperty(key)) {
                let item = messages[key];
                messageContent.push(
                  <div key={`message_${key}`}>
                    <p>{`${item.message}:`}</p>
                    <p>{item.name.join("、")}</p>
                  </div>
                );
              }
            }

            //有可删除的才两次删除
            if (successIds.length > 0) {
              Modal.confirm({
                width: 460,
                title: `您选择的回款计划中，以下${failList.length}个无法删除`,
                content: (
                  <div>
                    <div
                      style={{
                        paddingTop: 15,
                        paddingBottom: 15
                      }}
                    >
                      {messageContent}
                    </div>
                    <p
                      style={{
                        fontSize: "14px"
                      }}
                    >
                      是否继续删除其他选中回款计划？
                    </p>
                  </div>
                ),
                onOk() {
                  return _this.receipt
                    .delete(successIds.join(","))
                    .then(res => {
                      if (res.success) {
                        message.success("删除成功");
                        _this.gridManager.grid.reload();
                      }
                    });
                }
              });
            } else {
              _this.gridManager.clearRowSelect()
              // _this.setState({ selectRowsCount: 0, selectIds: [] });

              //错误同一个原因时
              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的回款计划无法删除：",
                content: (
                  <div
                    style={{
                      paddingTop: 15
                    }}
                  >
                    {messageContent}
                  </div>
                ),
                okText: "确定"
              });
            }
          } else if (res.success) {
            message.success("删除成功");
            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };
  render() {
    const PermissionButton = Permission(
      <Button className={"btn_add"} onClick={() => this.addPlanModal.show()}>
        <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} />
        新增回款计划
      </Button>
    );

    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>财务管理</Breadcrumb.Item>
          <Breadcrumb.Item>回款计划管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/receipt/plan/get_page"
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
                        <Menu.Item key="all">全部</Menu.Item>
                        <Menu.Item key="month">本月的</Menu.Item>
                        <Menu.Item key="undone">未回款</Menu.Item>
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
                  <PermissionButton auth="receipt.plan.add" />
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
                  <span className="separator">|</span>
                  <a className="ant-btn-link" onClick={this.handleRemove}>
                    <Icon type="delete" />删除
                  </a>
                </div>
              </div>
            </div>
          </GridManager>
        </div>

        <AddPlanModal
          history={this.props.history}
          reload={this.reload}
          ref={ref => (this.addPlanModal = ref)}
        />
        <div ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
          <AddCashModal
            container={this.container}
            reload={this.reload}
            ref={ref => (this.addCashModal = ref)}
          />
        </div>
        <FloatPanel reload={this.reload} ref={ref => (this.floatPanel = ref)} />
      </Page>
    );
  }
}
