import React from "react";
import extend from "extend";
import PropTypes from "prop-types";

import {
  Breadcrumb,
  Menu,
  Dropdown,
  Icon,
  Popover,
  Popconfirm,
  Button,
  Modal,
  Select,
  message,
  Tooltip
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import ClassNames from "classnames";
import GM from "lib/gridManager";
import Utils from "utils/";
import EnumNotice from "enum/enumNotice";

import AuditModal from "services/common/auditModal";
import EditNoticeModal from "services/product/notice/editNoticeModal";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";

import Notice from "model/Product/notice";
import NoticeType from "model/Product/noticeType";

import style from "./Index.scss";

const { Option } = Select;
const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";
const icon_question = "/assets/images/icon/问号";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

const { EnumNoticeStatus, EnumNoticeSend } = EnumNotice;

export default class ProductNoticeIndex extends Base {
  static get NAME() {
    return "ProductNoticeIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductNoticeIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      noticeTypes: [],
      menuName: {
        text: "我创建的公告",
        value: "1"
      }
    };

    this.popconfirm = [];
    this.popSelect = [];
    this.popSelectValue = [];
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
          return {
            label: item.name,
            value: item.id,
            isPermitDelete: item.isPermitDelete
          };
        });

        this.setState({ noticeTypes });
      }
    });
  };
  getColumns = () => {
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
              onClick={() => {
                let canEdit =
                  [
                    EnumNoticeStatus.enum.REVIEW,
                    EnumNoticeStatus.enum.PASS
                  ].indexOf(record.status) === -1;
                this.handleEditModal(record.id, false, canEdit);
              }}
            >
              {record.title}
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
              role="customerName"
              title={record.productName}
              onClick={() =>
                this.showModal("ProductDetailFloat", {
                  id: record.productId
                })
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
          return record.noticeTypeName;
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
        width: 200,
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
        title: "创建人",
        dataIndex: "createUserRealName",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="createUserRealName" mod={this} />
          </div>
        )
      },
      {
        title: "创建日期",
        dataIndex: "createDate",
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
        title: "发布日期",
        dataIndex: "sendTime",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="sendTime" mod={this} />
            <GridDateFilter filterKey="sendTime" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "发布状态",
        dataIndex: "isSend",
        filters: EnumNoticeSend.dictionary,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="isSend" mod={this} />
          </div>
        ),
        render: (text, record) => {
          let popover = text => (
            <Popover placement="topRight" content={text} arrowPointAtCenter>
              <img
                src={icon_question + "@1x.png"}
                srcSet={icon_question + "@2x.png 2x"}
              />
            </Popover>
          );
          let content = null;
          if (record.status === EnumNoticeStatus.enum.REVIEW) {
            content = (
              <div>
                <span>{EnumNoticeSend.keyValue[text]}</span>
                {popover(`申请发布待审批，申请人：${record.applyUserRealName}`)}
              </div>
            );
          } else if (
            record.status === EnumNoticeStatus.enum.PASS &&
            record.isSend === EnumNoticeSend.enum.UNPUBLISHED &&
            record.isTimingSend === 1
          ) {
            //审批通过 ，未发布，定时发布
            content = (
              <div>
                <span>{EnumNoticeSend.keyValue[text]}</span>
                {popover(
                  `申请通过未发布，计划发布时间：${Utils.formatDate(
                    record.sendTime,
                    "YYYY-MM-DD HH:mm"
                  )}`
                )}
              </div>
            );
          } else if (record.status === EnumNoticeStatus.enum.REJECT) {
            content = (
              <div>
                <span className="red">{EnumNoticeSend.keyValue[text]}</span>
                {popover(
                  `申请发布已驳回，申请人：${record.applyUserRealName}，原因：${
                    record.reason
                  }`
                )}
              </div>
            );
          } else if (record.status === EnumNoticeStatus.enum.UNDO) {
            content = (
              <div>
                <span>{EnumNoticeSend.keyValue[text]}</span>
                {popover(
                  `申请发布已取消，申请人：${record.applyUserRealName}，原因：${
                    record.reason
                  }`
                )}
              </div>
            );
          } else {
            content = EnumNoticeSend.keyValue[text];
          }
          return content;
        }
      },
      {
        title: "操作",
        width: 140,
        fixed: "right",
        render: (text, record) => {
          let options = [];
          //申请发布有数据权限就可以，其它需要数据权限且是发起人(申请发布操作者)
          if (
            record.status === EnumNoticeStatus.enum.PENDING ||
            record.status === EnumNoticeStatus.enum.UNDO
          ) {
            options.push(
              record.canProcess ? (
                <a
                  key="init"
                  onClick={() => {
                    this.handleChangeStatus(record.id, 2, "确定申请发布公告？");
                  }}
                >
                  申请发布
                </a>
              ) : (
                <Popover
                  placement="top"
                  content={record.notCanProcess}
                  arrowPointAtCenter
                >
                  <span className="disabled">申请发布</span>
                </Popover>
              )
            );
          } else if (record.status === EnumNoticeStatus.enum.REVIEW) {
            options.push(
              record.canProcess && record.applyUser ? (
                <a
                  key="cancel"
                  onClick={() => {
                    this.handleCancelModal(record);
                  }}
                >
                  取消申请
                </a>
              ) : (
                <Popover
                  placement="top"
                  content={
                    record.applyUser === false
                      ? "审批进行中，仅限申请发起人可执行此操作"
                      : record.notCanProcess
                  }
                  arrowPointAtCenter
                >
                  <span className="disabled">取消申请</span>
                </Popover>
              )
            );
          } else if (record.status === EnumNoticeStatus.enum.REJECT) {
            options.push(
              record.canProcess && record.applyUser ? (
                <a
                  key="reApply"
                  onClick={() => {
                    this.handleChangeStatus(record.id, 2, "确定申请发布公告？");
                  }}
                >
                  重新申请
                </a>
              ) : (
                <Popover
                  placement="top"
                  content={
                    record.applyUser === false
                      ? "审批进行中，仅限申请发起人可执行此操作"
                      : record.notCanProcess
                  }
                  arrowPointAtCenter
                >
                  <span className="disabled">重新申请</span>
                </Popover>
              ),
              record.canProcess && record.applyUser ? (
                <a
                  key="cancel"
                  onClick={() => {
                    this.handleCancelModal(record);
                  }}
                >
                  取消申请
                </a>
              ) : (
                <Popover
                  placement="top"
                  content={
                    record.applyUser === false
                      ? "审批进行中，仅限申请发起人可执行此操作"
                      : record.notCanProcess
                  }
                  arrowPointAtCenter
                >
                  <span className="disabled">取消申请</span>
                </Popover>
              )
            );
          }
          return <div className="operation">{options}</div>;
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
    this.resetFilterByKey(params, "createUserRealName");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "sendTime");
    this.resetFilterByKey(params, "isSend");

    if (params.createDate && params.createDate.length) {
      params.createDateStart = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }
    if (params.sendTime && params.sendTime.length) {
      params.sendTimeStart = params.sendTime[0];
      params.sendTimeEnd = params.sendTime[1];
      delete params.sendTime;
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

    let type = this.state.menuName.value;
    params.type = type === "1" ? type : "";

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
  showModal(modal, data) {
    this.refs[modal].show(data);
  }
  handleSelect(selectData) {
    let { selectIds, selectRowsCount = 0, selectRowsData } = selectData;
    this.setState({ selectIds, selectRowsCount, selectRowsData });
  }
  reloadGrid() {
    this.gridManager.grid.reload();
  }
  /**
   * 删除公告
   *
   * @returns
   * @memberof ProductNoticeIndex
   */
  handleRemoveNotice = () => {
    let { selectIds } = this.state,
      _this = this;

    Modal.confirm({
      width: 350,
      title: "删除后不可撤回，确定吗?",
      onOk() {
        return _this.notice.delete(selectIds.join(",")).then(res => {
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
                title: `您选择的产品公告中，以下${
                  failList.length
                }个公告无法删除`,
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
                      是否继续删除其他选中公告？
                    </p>
                  </div>
                ),
                onOk() {
                  return _this.notice.delete(successIds.join(",")).then(res => {
                    if (res.success) {
                      message.success("删除成功");
                      _this.gridManager.grid.reload();
                    }
                  });
                }
              });
            } else {
              _this.gridManager.clearRowSelect();

              //错误同一个原因时
              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的产品公告无法删除：",
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
  handleChangeStatus = (id, status, title) => {
    Modal.confirm({
      width: 350,
      title: title,
      onOk: () => {
        let request = this.notice.sub_flow;

        request({ id, status }).then(res => {
          if (res.success) {
            message.success("保存成功");
            this.reloadGrid();
          }
        });
      }
    });
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
  handleEditModal = (noticeId, isEdit, canEdit) => {
    this.editNoticeModal.show(noticeId, isEdit, canEdit);
  };

  /**
   * 取消申请弹窗回调
   *
   */
  handleCancel = (data, auditModal) => {
    data.id = this.cancelId;

    this.notice.clear_flow(data).then(res => {
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
  render() {
    let { menuName, selectRowsCount, noticeTypes } = this.state;

    const PermissionButton = Permission(
      <Button
        className={"btn_add"}
        onClick={() => this.handleEditModal(null, true, false)}
      >
        <img
          src={icon_add + "@1x.png"}
          srcSet={icon_add + "@2x.png 2x"}
          alt="新增公告"
        />
        新增公告
      </Button>
    );

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>产品管理</Breadcrumb.Item>
          <Breadcrumb.Item>公告管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/product/notice/get_page"
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
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="">全部公告</Menu.Item>
                      <Menu.Item key="1">我创建的公告</Menu.Item>
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
                <PermissionButton auth="product.notice.add" />
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
                <a className="ant-btn-link" onClick={this.handleRemoveNotice}>
                  <Icon type="delete" />删除
                </a>
              </div>
            </div>
          </GridManager>
          <EditNoticeModal
            ref={ref => (this.editNoticeModal = ref)}
            container={this.container}
            noticeType={noticeTypes}
            reload={() => {
              this.reloadGrid();
            }}
            callback={this.getNoticeType}
          />

          <AuditModal
            title="取消申请"
            labelName="取消原因"
            ref={ref => (this.auditModal = ref)}
            callback={this.handleCancel}
          />
        </div>
        <ProductDetailFloat ref="ProductDetailFloat" />
      </Page>
    );
  }
}
