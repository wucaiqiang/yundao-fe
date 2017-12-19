/**
 * 角色权限管理
 */
import React from "react";

import PropTypes from "prop-types";

import Base from "../../../components/main/Base";
import Page from "../../../components/main/Page";

import { Breadcrumb, Tabs, Icon, Button, Modal, Tree, message } from "antd";

import Role from "../../../model/Role/";

import EditRoleModal from "../../../services/system/config/editRoleModal";
import RoleResource from "../../../services/system/config/roleResource";
import RoleUser from "../../../services/system/config/roleUser";
import RoleData from "../../../services/system/config/roleData";

import style from "./Role.scss";

const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;

class SystemConfigRole extends Base {
  static get NAME() {
    return "SystemConfigRole";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[SystemConfigRole.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      roleData: [],
      activeRoleId: null,
      activeTabKey: "1"
    };
    this.role = new Role();
  }
  componentWillMount() {
    this.getRoleList();
  }

  /**
   * 获取角色数据
   *
   * @memberof SystemConfigRole
   */
  getRoleList = () => {
    this.role.gets().then(res => {
      if (res.success) {
        this.setState({ roleData: res.result, role: res.result[0] });
      }
    });
  };

  /**
   * 新增编辑角色
   *
   * @param {any} [data={}]
   * @memberof SystemConfigRole
   */
  handleRole = (data = {}) => {
    console.log("data", data);
    this.refs.editRoleModal.show(data);
  };
  /**
   * 删除角色
   *
   * @param {any} id
   * @memberof SystemConfigRole
   */
  handleDelRole = data => {
    const _this = this;
    Modal.confirm({
      title: "删除角色",
      content: `确定删除角色“${data.name}”吗？`,
      onOk() {
        return _this.role.del(data.id).then(res => {
          if (res.success) {
            _this.getRoleList();
          }
        });
      }
    });
  };
  handleChangeRole = role => {
    this.setState({ role });
  };

  handleTabChange = activeTabKey => {
    this.setState({ activeTabKey });
  };

  /**
   * tab栏保存按钮
   *
   * @returns
   * @memberof SystemConfigRole
   */
  handleSubmit = () => {
    let { activeTabKey } = this.state;

    if (activeTabKey === "1") {
      this.roleResource.handleSave();
    } else if (activeTabKey === "2") {
      this.roleData.handleSave();
    }
  };

  renderRoleList() {
    const tree_title = item => {
        return (
          <div
            className="tree_icon"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.handleChangeRole(item);
            }}
          >
            <div className="tree_menu">{item.name}</div>

            <div className="tree_icon_icons">
              <img
                className="anticon"
                src={"/assets/images/icon/编辑@1x.png"}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.handleRole(item);
                }}
                srcSet="/assets/images/icon/编辑@2x.png"
              />
              {item.isSystem ? null : (
                <img
                  className="anticon"
                  src={"/assets/images/icon/删除@1x.png"}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleDelRole(item);
                  }}
                  srcSet="/assets/images/icon/删除@2x.png"
                />
              )}
            </div>
          </div>
        );
      },
      { roleData, role } = this.state;
    const roleId = role && role.id;
    return (
      <Tree>
        {roleData.map(item => {
          return (
            <TreeNode
              key={item.id}
              className={item.id == roleId ? "active" : null}
              title={tree_title(item)}
            />
          );
        })}
      </Tree>
    );
  }
  render() {
    let { activeTabKey, role } = this.state;
    console.log("this.state", this.state);
    const activeRoleId = role && role.id;
    return (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item>角色管理</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className={`page-content ${style.content}`}>
          <div className={style.tabbar}>
            <div className={style.header}>
              <div className={style.title}>
                角色列表
                <Icon
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleRole();
                  }}
                  type="plus"
                  style={{
                    fontSize: 16,
                    color: "#D4A667"
                  }}
                />
              </div>
            </div>
            <div className={style.body}>{this.renderRoleList()}</div>
          </div>
          {activeRoleId ? (
            <div className={style.tab_content}>
              <Tabs
                type="card"
                onChange={this.handleTabChange}
                activeKey={activeTabKey}
                tabBarExtraContent={
                  activeTabKey === "3" ? null : (
                    <Button
                      disabled={activeRoleId === null}
                      onClick={this.handleSubmit}
                    >
                      保存
                    </Button>
                  )
                }
              >
                <TabPane tab="功能权限" style={{ borderLeft: "none" }} key="1">
                  {activeTabKey != "1" ? null : (
                    <RoleResource
                      ref={ref => (this.roleResource = ref)}
                      role={role}
                    />
                  )}
                </TabPane>
                <TabPane tab="数据权限" key="2">
                  {activeTabKey != "2" ? null : (
                    <RoleData ref={ref => (this.roleData = ref)} role={role} />
                  )}
                </TabPane>
                <TabPane tab="关联员工" key="3">
                  {activeTabKey != "3" ? null : <RoleUser role={role} />}
                </TabPane>
              </Tabs>
            </div>
          ) : null}
        </div>

        <EditRoleModal ref={"editRoleModal"} callback={this.getRoleList} />
      </Page>
    );
  }
}

function Mod(props) {
  return <SystemConfigRole {...props} />;
}

export default Mod;
