import React from "react";
import PropTypes from "prop-types";
import { Icon, Button, Modal, Popover, message } from "antd";

import GridBase from "../../../base/gridMod";

import GM from "../../../lib/gridManager.js";

import EditUserModal from "./editUserModal";

import User from "../../../model/User/";

import style from "./organizationUserList.scss";

const confirm = Modal.confirm;
const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const GridSortFilter = GM.GridSortFilter;
const FilterBar = GM.FilterBar;

const icon_export = "/assets/images/icon/导出@2x.png";
const icon_add = "/assets/images/icon/新增@2x.png";

export default class OrganizationList extends GridBase {
  static get NAME() {
    return "OrganizationList";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[OrganizationList.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      data: [],
      selectIds: [],
      selectRowsCount: 0,
      current: "1",
      departmentId: this.props.data.selectedDepartment
    };

    this.user = new User();
  }

  componentWillReceiveProps(nextProps) {
    const departmentId = this.props.data.selectedDepartment;
    if (nextProps.data.selectedDepartment !== departmentId) {
      this.setState(
        {
          departmentId: nextProps.data.selectedDepartment
        },
        () => {
          this.doReloadGrid();
        }
      );
    }
  }

  getColumns() {
    const columns = [
      {
        title: "姓名",
        dataIndex: "realName",
        width: 100,
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="realName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              onClick={() => this.showModal("editUserModal", record)}
            >
              {text}
            </a>
          );
        }
      },
      {
        title: "部门",
        dataIndex: "departmentName",
        width: 100,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="departmentName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return text;
        }
      },
      {
        title: "角色",
        dataIndex: "roleNames",
        width: 115,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="roleNames" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.roleNames.join(",");
        }
      },
      {
        title: "手机号码",
        dataIndex: "mobile",
        width: 120,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="mobile"
              mod={this}
              placeholder="请输入正确手机号"
            />
          </div>
        )
      },
      {
        title: "汇报上级",
        dataIndex: "leaderName",
        width: 120,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="leaderName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.leaderName;
        }
      },
      {
        title: "工号",
        dataIndex: "jobNumber",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="jobNumber" mod={this} />
            <GridInputFilter filterKey="jobNumber" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.jobNumber;
        }
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 80,
        fixed: "right",
        render: (text, record) => {
          return this.props.data.dimission ? (
            <a
              onClick={() => {
                this.handleEnabled(record.id);
              }}
            >
              启用
            </a>
          ) : record.isSystem === 1 ? (
            <Popover placement="topRight" content="预置账号不可停用">
              <span className="disabled">停用</span>
            </Popover>
          ) : (
            <a
              onClick={() => {
                this.handleDisabled(record.id);
              }}
            >
              停用
            </a>
          );
        }
      }
    ];

    return columns;
  }
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "departmentName");
    this.resetFilterByKey(params, "realName");
    this.resetFilterByKey(params, "roleNames", "roleName");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "leaderName");
    this.resetFilterByKey(params, "jobNumber");

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

  showModal = (modal, data) => {
    this.refs[modal].show(data);
  };
  handleSelect = selectData => {
    this.setState({ ...selectData });
  };
  handleDisabled = id => {
    const that = this;

    let ids = this.state.selectIds;

    if (typeof id === "number") {
      ids = [id];
    }

    confirm({
      title: "设定为停用后，用户不可再登录系统",
      content: "您可在停用员工列表中重新启用该账号",
      onOk() {
        that.user.dimission(ids).then(res => {
          if (res && res.success) {
            message.success("操作成功");
            that.doReloadGrid();
          }
        });
      },
      okText: "确定",
      cancelText: "取消"
    });
  };
  handleEnabled = id => {
    const that = this;

    let ids = this.state.selectIds;

    if (typeof id === "number") {
      ids = [id];
    }

    confirm({
      title: "是否启用",
      content: "启用后，账号可正常登录系统",
      onOk() {
        that.user.enabled(ids).then(res => {
          if (res && res.success) {
            message.success("操作成功");
            that.doReloadGrid();
          }
        });
      },
      okText: "确定",
      cancelText: "取消"
    });
  };

  handleClick = e => {
    this.setState({ current: e.key });
  };
  editUserModalSubmit = values => {
    this.doReloadGrid();
  };
  handleAddUser = () => {
    this.user.checkCanAdd().then(res => {
      if (res.success) {
        if (res.result) {
          this.showModal("editUserModal", {
            departmentId: this.state.departmentId
          });
        } else {
          Modal.info({
            width: 470,
            title: "无法新增员工，可开通账户数已达上限。您可以：",
            content: (
              <div>
                <p>1、停用在职员工的账户，释放名额</p>
                <p>2、联系云道客服开通更多账号</p>
                <p style={{ marginTop: 5 }}>客服电话：400-1515-003</p>
              </div>
            )
          });
        }
      }
    });
  };
  render() {
    const { children, data, ...others } = this.props;

    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    const table = (
      <div className="vant-panel">
        <GridManager
          onSelect={selectData => {
            this.handleSelect(selectData);
          }}
          columns={this.getColumns()}
          url={
            this.props.data.dimission
              ? `/user/get_cease_users?departmentId=${this.state.departmentId}`
              : `/user/get_enabled_users?departmentId=${
                  this.state.departmentId
                }`
          }
          beforeLoad={params => {
            return this.beforeLoad(params);
          }}
          loadSuccess={res => {
            this.setState({
              totalCount: res.data.result.totalCount || 0
            });
          }}
          gridWrapClassName="grid-panel auto-width-grid"
          mod={this}
          scroll={{
            x: "105%"
          }}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          <div className={`vant-filter-bar clearfix`}>
            <div className="vant-filter-bar-title fl">
              <span className={style.title}>
                {`共有${this.state.totalCount || 0}名`}
              </span>
            </div>
            <div className="fl">
              <FilterBar gridManager={this.gridManager} ref="filterBar" />
            </div>
            <div className="vant-filter-bar-action fr">
              {/* <Button className={'btn_export'}><img src={icon_export} alt=""/>导出</Button> */}
              {!this.props.data.dimission ? (
                <Button className={"btn_add"} onClick={this.handleAddUser}>
                  <img src={icon_add} />
                  新增员工
                </Button>
              ) : null}
            </div>

            <div className={this.getFloatToolsBarCls()}>
              已选择
              <span className="count">{this.state.selectRowsCount}</span>
              项
              <span className="separator">|</span>
              {data.dimission ? (
                <a className="ant-btn-link" onClick={this.handleEnabled}>
                  <Icon type="user" />启用
                </a>
              ) : (
                <a className="ant-btn-link" onClick={this.handleDisabled}>
                  <Icon type="user-delete" />停用
                </a>
              )}
            </div>
          </div>
        </GridManager>
      </div>
    );

    return (
      <div className={style.body}>
        {table}
        <EditUserModal submit={this.editUserModalSubmit} ref="editUserModal" />
      </div>
    );
  }
}
