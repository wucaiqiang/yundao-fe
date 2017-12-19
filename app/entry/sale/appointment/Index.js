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
import extend from "extend";

import EnumAppointment from "enum/enumAppointment";

import AuditModal from "services/common/auditModal";
import EditAppointmentModal from "services/sale/appointment/editAppointmentModal";
import AddDeclarationModal from "services/sale/appointment/addDeclarationModal";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";
import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";

import Dictionary from "model/dictionary";
import Appoint from "model/Appoint";

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

const { EnumAppointmentStatus } = EnumAppointment;

export default class SaleAppointmentIndex extends Base {
  static get NAME() {
    return "SaleAppointmentIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SaleAppointmentIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      filters: {
        dic_reservation_status: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.appoint = new Appoint();

    this.getDictionary();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  getDictionary() {
    this.dictionary.gets("dic_reservation_status").then(res => {
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
    const { dic_reservation_status } = this.state.filters,
      columns = [
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
            let canEdit = record.status === EnumAppointmentStatus.enum.REJECT;
            return (
              <a
                title={record.title}
                onClick={() => this.editAppointmentModal.show(record, canEdit)}
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
                onClick={() =>
                  this.customerDetailFloat.show({ id: record.customerId })
                }
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
                onClick={() =>
                  this.productDetailFloat.show({ id: record.productId })
                }
              >
                {record.productName}
              </a>
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
          title: "预约时间",
          dataIndex: "reservationDate",
          width: 140,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="reservationDate" mod={this} />
              <GridDateFilter filterKey="reservationDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
          }
        },
        {
          title: "状态",
          dataIndex: "statuss",
          filters: dic_reservation_status,
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

            if (record.status === EnumAppointmentStatus.enum.PENDING) {
              content = (
                <div>
                  <span>{record.statusText}</span>
                  {popover(`预约待审批`)}
                </div>
              );
            } else if (record.status === EnumAppointmentStatus.enum.PASS) {
              content = <span className="green">{record.statusText}</span>;
            } else if (record.status === EnumAppointmentStatus.enum.REJECT) {
              content = (
                <div>
                  <span className="red">{record.statusText}</span>
                  {popover(`预约已驳回，原因：${record.reason}`)}
                </div>
              );
            } else if (record.status === EnumAppointmentStatus.enum.UNDO) {
              content = (
                <div>
                  <span>{record.statusText}</span>
                  {popover(`预约已取消，原因：${record.reason}`)}
                </div>
              );
            } else if (record.status === EnumAppointmentStatus.enum.INVALID) {
              content = (
                <div>
                  <span>{record.statusText}</span>
                  {popover(`预约已作废，原因：${record.reason}`)}
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

            if (record.hasDeclaration) {
              content = "已报单";
            } else if (record.status === EnumAppointmentStatus.enum.PENDING) {
              content = (
                <a onClick={() => this.handleCancelModal(record)}>取消预约</a>
              );
            } else if (record.status === EnumAppointmentStatus.enum.REJECT) {
              content = (
                <div>
                  <a
                    onClick={() =>
                      this.editAppointmentModal.show(record, true, true)
                    }
                  >
                    重新提交
                  </a>
                  <a onClick={() => this.handleCancelModal(record)}>取消预约</a>
                </div>
              );
            } else if (
              record.status === EnumAppointmentStatus.enum.PASS &&
              record.discard === false
            ) {
              content = (
                <a
                  onClick={() => {
                    record.from = "appointment.my";
                    this.editDeclarationModal.show(record);
                  }}
                >
                  转报单
                </a>
              );
            }
            return <div className="operation">{content}</div>;
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
    this.resetFilterByKey(params, "reservationDate");
    this.resetFilterByKey(params, "statuss");

    if (params.reservationAmount && params.reservationAmount.length) {
      params.reservationStartAmount = params.reservationAmount[0];
      params.reservationEndAmount = params.reservationAmount[1];
      delete params.reservationAmount;
    }
    if (params.estimatePayDate && params.estimatePayDate.length) {
      params.estimatePayStartDate = params.estimatePayDate[0];
      params.estimatePayEndDate = params.estimatePayDate[1];
      delete params.estimatePayDate;
    }
    if (params.reservationDate && params.reservationDate.length) {
      params.reservationStartDate = params.reservationDate[0];
      params.reservationEndDate = params.reservationDate[1];
      delete params.reservationDate;
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
  reloadGrid = () => {
    this.gridManager.grid.reload();
  };
  /**
   * 取消弹窗回调
   *
   */
  handleCancel = (data, auditModal) => {
    data.id = this.cancelId;

    this.appoint.cancel(data).then(res => {
      auditModal.commit(false);
      if (res.success) {
        auditModal.hide();
        this.reloadGrid();
      }
    });
  };
  handleCancelModal = data => {
    this.cancelId = data.id;
    this.auditModal.show();
  };
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
  render() {
    const PermissionButton = Permission(
      <Button
        className={"btn_add"}
        onClick={() => this.editAppointmentModal.show(null, false)}
      >
        <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} />
        新增预约
      </Button>
    );
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>我的预约</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/reservation/gets/my"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "120%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                <PermissionButton auth="sale.appointment.add" />
              </div>
            </div>
          </GridManager>
          <EditAppointmentModal
            reload={this.reloadGrid}
            ref={ref => (this.editAppointmentModal = ref)}
          />
          <AddDeclarationModal
            initFields="productName,customerName"
            reload={this.reloadGrid}
            parent={this}
            ref={ref => (this.editDeclarationModal = ref)}
            history={this.props.history}
          />
          <AuditModal
            title="取消预约"
            labelName="取消原因"
            ref={ref => (this.auditModal = ref)}
            callback={this.handleCancel}
          />
        </div>
        <CustomerDetailFloat
          reload={this.reloadGrid}
          ref={ref => (this.customerDetailFloat = ref)}
        />
        <DeclarationDetailFloat
          ref={ref => (this.declarationDetailFloat = ref)}
        />
        <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
      </Page>
    );
  }
}
