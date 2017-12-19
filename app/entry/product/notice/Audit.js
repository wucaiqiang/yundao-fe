import React from "react";
import PropTypes from "prop-types";

import {
  Breadcrumb,
  Icon,
  Input,
  Menu,
  Button,
  Dropdown,
  Popover,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";
import EnumNotice from "enum/enumNotice";

import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import EditNoticeModal from "services/product/notice/editNoticeModal";
import AuditModal from "services/common/auditModal";
import AuditRecordModal from "services/product/notice/auditRecordModal";

import Notice from "model/Product/notice";
import NoticeType from "model/Product/noticeType";

import style from "./Index.scss";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

const { EnumNoticeStatus } = EnumNotice;

export default class ProductNoticeAudit extends Base {
  static get NAME() {
    return "ProductNoticeAudit";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductNoticeAudit.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "未处理的申请",
        value: "unprocess"
      },
      filters: {},
      noticeTypes: []
    };
  }
  componentWillMount() {
    this.notice = new Notice();
    this.noticeType = new NoticeType();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    this.getNoticeType();
  }
  /**
   * 获取所有公告类型
   *
   * @memberof ProductNoticeIndex
   */
  getNoticeType = () => {
    this.noticeType.gets().then(res => {
      if (res.success && res.result) {
        let noticeTypes = res.result.map(item => {
          return { text: item.name, value: item.id };
        });

        this.setState({ noticeTypes });
      }
    });
  };
  getColumns = () => {
    const PermissionButton = record => {
      return Permission(
        <span>
          <a
            onClick={() =>
              this.handlePassModal({
                id: record.noticeId,
                status: EnumNoticeStatus.enum.PASS
              })
            }
          >
            通过
          </a>
          <a onClick={() => this.handleAuditModal(record)}>驳回</a>
        </span>,
        <span>
          <Popover
            placement="topRight"
            content={"无权限操作"}
            arrowPointAtCenter
          >
            <span className="disabled">通过</span>
          </Popover>
          <Popover
            placement="topRight"
            content={"无权限操作"}
            arrowPointAtCenter
          >
            <span className="disabled">驳回</span>
          </Popover>
        </span>
      );
    };

    const columns = [
      {
        title: "公告标题",
        dataIndex: "title",
        width: 200,
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="title" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              title={record.title}
              onClick={() => this.editNoticeModal.show(record.noticeId)}
            >
              {record.title}
            </a>
          );
        }
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        className: "ant-table-col",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="productName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              role="customerName"
              title={record.productName}
              onClick={() =>
                this.refs["ProductDetailFloat"].show({ id: record.productId })
              }
            >
              {record.productName}
            </a>
          );
        }
      },
      {
        title: "公告类型",
        dataIndex: "noticeTypeIds",
        filters: this.state.noticeTypes,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="noticeTypeIds" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.noticeType;
        }
      },

      {
        title: "公告概要",
        dataIndex: "content",
        width: 200,
        className: "ant-table-col",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="content" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return <span title={record.content}>{record.content}</span>;
        }
      },
      {
        title: "公告附件",
        dataIndex: "baseProductNoticeAttach",
        width: 300,
        render: (text, record) => {
          let attachs = record.baseProductNoticeAttach;
          return attachs && attachs.length > 0
            ? attachs.map(attach => {
                return (
                  <div key={attach.id}>
                    <a href={attach.url} target="_blank">
                      {attach.sourceName}
                    </a>
                  </div>
                );
              })
            : null;
        }
      },
      {
        title: "申请发起人",
        dataIndex: "createUser",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="createUser" mod={this} />
          </div>
        )
      },
      {
        title: "申请操作",
        render: (text, record) => {
          return "申请发布";
        }
      },
      {
        title: "申请时间",
        dataIndex: "createDate",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="createDate" mod={this} />
            <GridDateFilter filterKey="createDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text);
        }
      },
      {
        title: "审批时间",
        dataIndex: "updateDate",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="updateDate" mod={this} />
            <GridDateFilter filterKey="updateDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text);
        }
      },
      {
        title: "审批结果",
        dataIndex: "statuss",
        filters: EnumNoticeStatus.dictionary.slice(1),
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="statuss" mod={this} />
          </div>
        ),
        render: (text, record) => {
          let statusText = EnumNoticeStatus.keyValue[record.status];
          if (record.status === EnumNoticeStatus.enum.PASS) {
            return <span className="green">{statusText}</span>;
          } else if (record.status === EnumNoticeStatus.enum.REJECT) {
            return (
              <Popover
                placement="topLeft"
                content={record.reason}
                arrowPointAtCenter
              >
                <span className="red">{statusText}</span>
              </Popover>
            );
          } else {
            return statusText;
          }
        }
      },
      {
        title: "操作",
        dataIndex: "operation",
        width: 150,
        fixed: "right",
        render: (text, record) => {
          if (record.status === EnumNoticeStatus.enum.REVIEW) {
            const NoticePermissionButton = PermissionButton(record);
            return (
              <div className="operation">
                <NoticePermissionButton auth="product.notice.flow" />
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
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "noticeTypeIds");
    this.resetFilterByKey(params, "title");
    this.resetFilterByKey(params, "content");
    this.resetFilterByKey(params, "createUser");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "updateDate");
    this.resetFilterByKey(params, "statuss");

    if (params.createDate && params.createDate.length) {
      params.createDateStart = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }
    if (params.updateDate && params.updateDate.length) {
      params.updateDateStart = params.updateDate[0];
      params.updateDateEnd = params.updateDate[1];
      delete params.updateDate;
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

    params.scope = this.state.menuName.value;

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
  handleMenuClick = e => {
    let menuName = {
      text: e.item.props.children,
      value: e.key
    };

    this.setState({ menuName }, () => {
      // this.gridManager.grid.load();
      this.gridManager.grid.reload();
    });
  };
  handlePassModal = data => {
    const _this = this;
    this.notice.flow(data).then(res => {
      if (res.success) {
        message.success("操作成功");

        _this.gridManager.grid.reload();
      }
    });
  };
  /**
   * 驳回弹窗回调
   *
   * @memberof ProductControlAudit
   */
  handleAuditReject = (data, auditModal) => {
    data.id = this.auditId;
    data.status = EnumNoticeStatus.enum.REJECT;

    const _this = this;
    this.notice.flow(data).then(res => {
      auditModal.commit(false);
      if (res.success) {
        message.success("操作成功");

        auditModal.hide();
        _this.gridManager.grid.reload();
      }
    });
  };
  handleAuditModal = data => {
    this.auditId = data.noticeId;
    this.auditModal.show();
  };
  render() {
    const { menuName } = this.state;

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>产品管理</Breadcrumb.Item>
          <Breadcrumb.Item>公告审批</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/product/notice/get_page_flow"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{ x: "180%" }}
            ref={gridManager => (this.gridManager = gridManager)}
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
          <EditNoticeModal
            ref={ref => (this.editNoticeModal = ref)}
            container={this.container}
            noticeType={this.state.noticeTypes}
            reload={() => {
              this.gridManager.grid.reload();
            }}
            callback={this.getNoticeType}
          />
          <AuditModal
            ref={ref => (this.auditModal = ref)}
            callback={this.handleAuditReject}
          />
          <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
        </div>
        <ProductDetailFloat ref="ProductDetailFloat" />
      </Page>
    );
  }
}
