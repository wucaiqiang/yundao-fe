/**
 * 组织结构管理
 */
import React from "react";
import extend from "extend";
import PropTypes from "prop-types";

import Base from "../../../components/main/Base";
import Page from "../../../components/main/Page";

import {
  Breadcrumb,
  Table,
  Icon,
  Form,
  Input,
  Button,
  Menu,
  Tree,
  Spin,
  Tabs,
  Modal
} from "antd";

const SubMenu = Menu.SubMenu;
const TreeNode = Tree.TreeNode;

const TabPane = Tabs.TabPane;

import style from "./Organization.scss";


import utils from "../../../utils/";

import GM from "../../../lib/gridManager.js";
const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const FilterBar = GM.FilterBar;

import EditOrganizationModal from "../../../services/system/config/editOrganizationModal";
import OrganizationUserList from "../../../services/system/config/organizationUserList";

const icon_export = "/assets/images/icon/导出@2x.png";
const icon_add = "/assets/images/icon/新增@2x.png";

import Department from "../../../model/Department/";


import GridBase from "../../../base/gridMod";

class SystemConfigOrganization extends GridBase {
  static get NAME() {
    return "SystemConfigOrganization";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SystemConfigOrganization.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      data: [],
      sorter: {},
      selectedDepartment: 0,
      selectRowsData: [],
      preference: [],
      selectIds: [],
      selectRowsCount: 0,
      selectData: {},
      searchKey: "",
      currentTab: "1"
    };
    this.userInfo = utils.getStorage("userInfo");
  }

  componentDidMount() {
    this.requestData();
  }
  requestData() {
    this.loadDepartment();
  }

  loadDepartment() {
    utils.setStorage("department", null);
    const department = new Department();
    department.gets().then(res => {
      console.log('res',res)
      if (res.success) {
        this.setState(
          {
            department: res.result
          }
        );
        utils.setStorage("department", res.result);
      }
    });
  }

  showModal(modal, data) {
    this.refs[modal].show(data);
  }

  handleTabChange = key => {
    this.setState({ currentTab: key });
  };
  departmentSelected = (departmentId, e) => {
    this.setState({
      selectedDepartment: departmentId
    });
  };
  submitEditOrganizationModal = values => {
    this.loadDepartment();
  };
  deleteDepartment = item => {
    const request = new Department();
    const that = this;
    Modal.confirm({
      title: `确定删除部门“${item.name}”吗？`,
      iconType: "exclamation",
      content: "删除成功后，该操作将无法恢复。",
      onOk() {
        request.delete(item.id).then(res => {
          if (res.success) {
            that.loadDepartment();
          }
        });
      },
      onCancel() {
        console.log("Cancel");
      },
      okText: "确定",
      cancelText: "取消"
    });
  };
  render() {
    const { children, ...others } = this.props;
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    const {selectedDepartment} = this.state

    const tree_title = (item,depth) => {
      return (
        <div
          className="tree_icon"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.departmentSelected(item.id);
          }}
        >
          <div className={"tree_title"} style={{
            textIndent:(depth ||1)*24
          }}>
            {item.name}
          </div>
          <div className="tree_icon_icons">
            <img className='anticon' src={'/assets/images/icon/编辑@1x.png' } onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.showModal("EditOrganizationModal", item);
            }} srcSet='/assets/images/icon/编辑@2x.png'/>
            <img className='anticon' src={'/assets/images/icon/删除@1x.png' } onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      this.deleteDepartment(item);
                    }} srcSet='/assets/images/icon/删除@2x.png'/>
          </div>
        </div>
      );
    };
    const loop = (data,depth = 0) =>
      data.map(item => {
        if (item.childs && item.childs.length) {
          return (
            <TreeNode className={item.id == selectedDepartment ? "active" : null} key={item.id} title={tree_title(item,depth)}>
              {loop(item.childs,depth+1)}
            </TreeNode>
          );
        }
        return <TreeNode className={item.id == selectedDepartment ? "active" : null} key={item.id} title={tree_title(item,depth)} />;
      });
    return (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item>组织结构管理</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={`page-content ${style.content}`}>
          <div className={style.tabbar}>
            <div className={style.header}>
              <div className={style.title}>
                部门
                <Icon
                  onClick={() => {
                    this.showModal("EditOrganizationModal", {
                      parentId: this.state.selectedDepartment
                    });
                  }}
                  type="plus"
                  style={{
                    fontSize: 16,
                    color: "#D4A667"
                  }}
                />
              </div>
            </div>
            <div className={style.body}>
              <div
                className={style.name}
                onClick={() => {
                  this.departmentSelected(0);
                }}
              >
                {(this.userInfo && this.userInfo.tenantName) || "--"}
              </div>
              <Tree>
                {this.state.department ? loop(this.state.department) : null}
              </Tree>
            </div>
          </div>
          <div className={style.tab_content}>
            <Tabs type="card" onChange={this.handleTabChange}>
              <TabPane tab="在职员工" key="1">
                {this.state.currentTab != "1"
                  ? null
                  : <OrganizationUserList
                      ref="OrganizationUserList_1"
                      mod={this}
                      data={{
                        selectedDepartment: this.state.selectedDepartment,
                        dimission: false
                      }}
                    />}
              </TabPane>
              <TabPane tab="停用员工" key="2">
                {this.state.currentTab != "2"
                  ? null
                  : <OrganizationUserList
                      ref="OrganizationUserList_2"
                      data={{
                        selectedDepartment: this.state.selectedDepartment,
                        dimission: true
                      }}
                      mod={this}
                      noRowSelection={true}
                    />}
              </TabPane>
            </Tabs>
          </div>
        </div>
        <EditOrganizationModal
          submit={this.submitEditOrganizationModal}
          ref="EditOrganizationModal"
        />
      </Page>
    );
  }
}

function Mod(props) {
  return <SystemConfigOrganization {...props} />;
}

export default Mod;
