import React, { Component } from "react";
import { Link } from "react-router-dom";
import { renderRoutes, matchRoutes } from "react-router-config";
import { Menu, Icon, Switch, Spin } from "antd";

import routes from "../../routes";

import Base from "./Base";
import Permission from "../permission";

import Auth from "../../model/Auth/";
import commonStyle from "const/layout";

import utils from "utils/";

import style from "./SideMenu.scss";

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

const menuIcon = {
  "product.center": "产品中心",
  proconf: "产品配置",
  "product.control": "产品管理",
  customer: "客户管理",
  sale: "销售管理",
  finance: "财务管理",
  system: "系统管理",
  "content.manager.menu": "内容配置",
  default: "默认"
};

export default class SideMenu extends Base {
  constructor(props) {
    super(props);
    this.state = {
      theme: "dark",
      current: "1",
      menus: window.APP.state.menu || []
    };
  }
  componentWillMount() {}
  componentDidMount() {
    this.mounted = true;
    if (!this.state.menus.length) {
      this.requestData();
    }
  }

  requestData() {
    this.auth = new Auth();
    this.auth.get_menu().then(res => {
      if (res && res.success) {
        if (res.result.menu) {
          this.setState({ menus: res.result.menu });
          window.APP.setState({
            menu: res.result.menu
          });
        }
        if (res.result.auth) {
          const permissions = res.result.auth.map(item => item.code).join(",");
          utils.setStorage("permissions", permissions);
        }
      }
    });
  }

  findPath(menus, path, dist) {
    if (!this.findDist) {
      for (var index = 0; index < menus.length; index++) {
        if (!this.findDist) {
          const menu = menus[index];
          if (menu.childs && menu.childs.length) {
            path.push(menu.code);
            this.findPath(menu.childs, path, dist);
          } else {
            if (menu.path == dist) {
              path.push(menu.code);
              this.findDist = true;
              break;
            } else if (index == menus.length - 1) {
              path.pop();
            }
          }
        }
      }
    }
  }

  getFullPath(dist) {
    let findDist = false;
    const findPath = (menus, path, dist) => {
      if (!findDist) {
        for (var index = 0; index < menus.length; index++) {
          if (!findDist) {
            const menu = menus[index];
            if (menu.path == dist) {
              path.push(menu.code);
              findDist = true;
              break;
            }
            if (menu.childs && menu.childs.length) {
              path.push(menu.code);
              findPath(menu.childs, path, dist);
              if (!findDist) {
                path.pop();
              }
            }
          }
        }
      }
    };
    let path = [];
    findPath(this.state.menus, path, dist);
    return path;
  }

  generatorSubMenu = (menus, selectedKeys = []) => {
    const { history } = this.props;
    const submenu =
      menus &&
      menus.length &&
      menus.map((menu, index) => {
        //不显示菜单
        if (menu.display === 0) return;

        let iconName = menuIcon[menu.code] ;
        let MenuIcon = (
          <Icon type="menu-icon">
            <img src={`/assets/images/menu/${iconName}@1x.png`} />
            <img
              className={"active"}
              src={`/assets/images/menu/${iconName}2@1x.png`}
            />
          </Icon>
        );
        if (menu.childs && menu.childs.length) {
          return (
            <SubMenu
              key={menu.code}
              auth={menu.code}
              title={
                <span
                  className={
                    selectedKeys.indexOf(menu.code) > -1 ? "active" : ""
                  }
                >
                  {iconName ? MenuIcon : null}
                  <span>{menu.name}</span>
                </span>
              }
            >
              {this.generatorSubMenu(menu.childs, selectedKeys)}
            </SubMenu>
          );
        } else {
          return (
            <MenuItem key={menu.code} auth={menu.code}>
              <span
                className={selectedKeys.indexOf(menu.code) > -1 ? "active" : ""}
              >
                {iconName ? MenuIcon : null}
                <span>{menu.name}</span>
              </span>
            </MenuItem>
          );
        }
      });
    return submenu;
  };

  /**
   * 获取默认展开菜单
   *
   * @returns
   * @memberof SideMenu
   */
  getDefaultOpenKeys(menus) {
    // const { menus } = this.state;
    let defaultOpenKeys = [];

    // if (menus && menus.length > 0) {
    menus.map((menu, index) => {
      defaultOpenKeys.push(menu.code);
    });
    // }

    return defaultOpenKeys;
  }

  changeMenu = ({ key }) => {
    let findDist = false;
    const findPath = (menus, path, dist) => {
      if (!findDist) {
        for (var index = 0; index < menus.length; index++) {
          if (!findDist) {
            const menu = menus[index];
            if (menu.childs && menu.childs.length) {
              path.push(menu.path);
              findPath(menu.childs, path, dist);
            } else {
              if (menu.code == dist) {
                path.push(menu.path);
                findDist = true;
                break;
              } else if (index == menus.length - 1) {
                path.pop();
              }
            }
          }
        }
      }
    };

    const { menus } = this.state;
    let path = [];
    findPath(menus, path, key);
    const link = path.pop();
    this.props.history.push(link);
  };

  componentWillReceiveProps(nextProps) {
    if (
      this.getFullPathFromPath(nextProps.location.pathname)[0] !=
      this.getFullPathFromPath(this.props.location.pathname)[0]
    ) {
      const { menus } = this.state;
      this.setState(
        {
          menus: []
        },
        () => {
          this.setState({
            menus
          });
        }
      );
    }
    return true;
  }

  getFullPathFromPath(pathname) {
    let selectedKeys = [],
      fullPath = null;

    fullPath = this.getFullPath(pathname);

    const { menus } = this.state;
    let childMenus = [];
    if (menus.length) {
      if (!fullPath || !fullPath.length) {
        const matchedRoutes = matchRoutes(routes, location.pathname);
        if (matchedRoutes && matchedRoutes.length) {
          const { match, route } = matchedRoutes[0];
          //是否受登录限制
          fullPath = this.getFullPath(route.parent);
        }
      }
    }
    return fullPath;
  }

  render() {
    const { pathname } = this.props.location;

    let selectedKeys = [],
      fullPath = null;

    fullPath = this.getFullPath(pathname);

    const { menus } = this.state;
    let childMenus = [];
    if (menus.length) {
      if (!fullPath || !fullPath.length) {
        const matchedRoutes = matchRoutes(routes, location.pathname);
        if (matchedRoutes && matchedRoutes.length) {
          const { match, route } = matchedRoutes[0];
          //是否受登录限制
          fullPath = this.getFullPath(route.parent);
        }
      }
      const rootMenus = menus.filter(item => item.code == fullPath[0]);
      console.log('rootMenus',rootMenus)
      childMenus = rootMenus && rootMenus.length ? rootMenus[0].childs :[];
    }

    if (pathname) {
      //根据pathname 遍历menus去获取路径得到defaultOpenKeys和selectedKeys
      selectedKeys.push(fullPath.pop());
    }

    return menus.length && childMenus.length ? (
      <div className={style.side_menu}>
        <Menu
          width={commonStyle.sidemenu.width}
          theme={this.state.theme}
          defaultOpenKeys={this.getDefaultOpenKeys(childMenus)}
          selectedKeys={selectedKeys}
          onClick={this.changeMenu}
          mode="inline"
        >
          {this.generatorSubMenu(childMenus, this.getFullPath(pathname))}
        </Menu>
      </div>
    ) : null;
  }
}
