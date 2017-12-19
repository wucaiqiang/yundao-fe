import React from "react";

import { Button } from "antd";

import GM from "../../../lib/gridManager.js";

import EditUserModal from "./editUserModal";

import User from "../../../model/User/";

const icon_export = "/assets/images/icon/导出@2x.png";

// import Base from '../../../components/main/Base'

import GridBase from "../../../base/gridMod";

const { GridManager, GridInputFilter, GridSortFilter, FilterBar } = GM;

export default class RoleUser extends GridBase {
  constructor(props, context) {
    super(props);
    this.state = {
      loading: true,
      roleId: this.props.role.id,
      data: []
    };
  }

  // componentDidMount(){
  //   this.setState({
  //     loading:true
  //   })
  // }

  componentWillReceiveProps(nextProps) {
    const roleId = this.props.role.id;
    if (nextProps.role.id !== roleId) {
      this.setState({ roleId: nextProps.role.id }, () => {
        this.doReloadGrid();
      });
    }
  }

  getColumns() {
    const columns = [
      {
        title: "姓名",
        dataIndex: "realName",
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
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="departmentName" mod={this} />
          </div>
        )
      },
      {
        title: "手机号码",
        dataIndex: "mobile",
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
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="leaderName" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.leaderName ? <span>{record.leaderName}</span> : null;
        }
      },
      {
        title: "工号",
        dataIndex: "jobNumber",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="jobNumber" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.jobNumber ? <span>{record.jobNumber}</span> : null;
        }
      }
    ];

    this.gridWidth = columns.reduce((sum, value) => {
      return sum + value;
    }, 60);

    return columns;
  }
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "realName");
    this.resetFilterByKey(params, "departmentName");
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

  editUserModalSubmit = values => {
    this.doReloadGrid();
  };
  render() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    return (
      <div
        className="body"
        style={{
          padding: "1.5rem"
        }}
      >
        <div className="vant-panel">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            url={`/user/get_by_role?roleId=${this.state.roleId}`}
            loadSuccess={res => {
              console.log("res:", res);
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
            <div>
              <div className={`vant-filter-bar clearfix`}>
                <div className="fl">
                  <FilterBar gridManager={this.gridManager} ref="filterBar" />
                </div>
                <div className="fr">
                  {/* <Button className={"btn_export"}>
                  <img src={icon_export} alt="" />导出
                </Button> */}
                </div>
              </div>
            </div>
          </GridManager>
          <EditUserModal
            submit={this.editUserModalSubmit}
            ref="editUserModal"
          />
        </div>
      </div>
    );
  }
}
