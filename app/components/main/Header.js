import React, { Component } from "react";
import { Link, Route, Redirect } from "react-router-dom";
import { renderRoutes, matchRoutes } from "react-router-config";
import { Menu, Avatar, Dropdown, message, Icon } from "antd";
import ClassNames from "classnames";

import Base from "./Base";

import utils from "utils/";
import Auth from "model/Auth/";

import Message from "services/message/message";
import ChangePasswordModal from "services/user/changePasswordModal";

import routes from "../../routes";

import style from "./Header.scss";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const menuMapIcon = {
  investment: "投资",
  wealth: "财富",
  backstage: "后台"
};

export default class Header extends Base {
  state = {
    login: true
  };
  componentWillMount() {
    this.userInfo = utils.getStorage("userInfo") || {};
  }
  logout = () => {
    const auth = new Auth();
    auth.logout().then(res => {
      if (res.success) {
        message.success("退出成功");
        this.setState({ login: false });
      }
    });
  };
  toggle = () => {
    this.props.toggle();
  };

  findFirstLeaf = menu => {
    if (menu.childs && menu.childs.length) {
      return this.findFirstLeaf(menu.childs[0]);
    } else {
      return menu;
    }
  };

  getFullPath(menus, dist) {
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
    findPath(menus, path, dist);
    return path;
  }
  handleClick = ({ key }) => {
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

    const menus = APP.state.menu;

    // 找到当前页面路径

    const { pathname } = this.props.location;

    let fullPath = this.getFullPath(menus, pathname);

    if (!fullPath || !fullPath.length) {
      const matchedRoutes = matchRoutes(routes, location.pathname);
      if (matchedRoutes && matchedRoutes.length) {
        const { match, route } = matchedRoutes[0];
        //是否受登录限制
        fullPath = this.getFullPath(route.parent);
      }
    }

    const navMenu = menus.filter(item => item.code == key)[0];

    const rootPath = fullPath[0];

    const firstLeaf = this.findFirstLeaf(navMenu);

    if (
      rootPath != navMenu.code &&
      routes.filter(item => item.path == navMenu.path)[0].needPassword == true
    ) {
      //当前路径的root code  不等于点击的navmenu的code 并且 点击的navmenu的code 需要密码验证
      // alert("need password");
      // //输入登录验证成功后 进行下面的步骤 跳转到navmenu的第一个叶子节点
      // return;
    }

    window.APP.setState({
      collapsed:false
    })

    this.props.history.push(firstLeaf.path);
  };
  render() {
    const navMenu = window.APP.state.menu;

    const { pathname } = this.props.location;

    let selectedKeys = [];

    if (pathname && navMenu && navMenu.length) {
      selectedKeys = this.getFullPath(navMenu, pathname);
      if (!selectedKeys || !selectedKeys.length) {
        const matchedRoutes = matchRoutes(routes, location.pathname);
        if (matchedRoutes && matchedRoutes.length) {
          const { match, route } = matchedRoutes[0];
          //是否受登录限制
          selectedKeys = this.getFullPath(navMenu, route.parent);
        }
      }
    }

    const dropdown = (
      <div className={style.mobile_dropdown}>
        <Menu>
          <Menu.Item key="0">
            <a
              href="javascript:;"
              onClick={() => this.changePasswordModal.show()}
            >
              修改密码
            </a>
          </Menu.Item>
          <Menu.Item key="1">
            <a href="javascript:;" onClick={this.logout}>
              退出
            </a>
          </Menu.Item>
        </Menu>
      </div>
    );
    const indexPage = routes[0].path;

    //选中菜单项
    const selectMenuItem = selectedKeys.length > 0 ? selectedKeys[0] : "";

    return !this.state.login ? (
      <Redirect to={`/login`} />
    ) : (
      <header className={style.header}>
        <div
          className={ClassNames(style.header_isv, {
            [style.header_isv_collapsed]: this.props.collapsed
          })}
        >
          <img src="/assets/images/index/云道-白@1x.png" alt="云道" />
        </div>
        <div>
          <div className={style.header_company}>
            <Icon
              className="trigger"
              type={this.props.collapsed ? "menu-unfold" : "menu-fold"}
              onClick={this.toggle}
            />
            <img src="/assets/images/menu/公司@1x.png" />
            {this.userInfo.tenantName}
          </div>

          <nav className={style.header_menu}>
            <ul>
              <li key={0} className={style.header_menu_item}>
                <div className={style.message}>
                  <Message />
                </div>
              </li>
              <li key={1} className={style.header_menu_item}>
                <div className={style.avatar}>
                  <img src="/assets/images/menu/默认头像@1x.png" />
                </div>
              </li>
              <li key={2} className={style.header_menu_item}>
                <Dropdown
                  overlay={dropdown}
                  getPopupContainer={() =>
                    document.getElementsByClassName(style.mobile)[0]
                  }
                >
                  <a className={`${style.mobile} ant-dropdown-link`}>
                    {this.userInfo.realName}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </li>
            </ul>
          </nav>
          <div className={style.header_module}>
            {navMenu && navMenu.length ? (
              <Menu
                mode="horizontal"
                onClick={this.handleClick}
                selectedKeys={selectedKeys}
              >
                {navMenu &&
                  navMenu.map(menu => {

                    if (menu.display)
                      return (
                        <Menu.Item key={menu.code}>
                          {selectMenuItem === menu.code ? (
                            <img
                              className="anticon"
                              src={`/assets/images/menu/${
                                menuMapIcon[menu.code]
                              }2@1x.png`}
                            />
                          ) : (
                            <img
                              className="anticon"
                              src={`/assets/images/menu/${
                                menuMapIcon[menu.code]
                              }@1x.png`}
                            />
                          )}

                          {menu.name}
                        </Menu.Item>
                      );
                  })}
              </Menu>
            ) : null}
          </div>
        </div>
        <ChangePasswordModal
          ref={ref => (this.changePasswordModal = ref)}
          callback={() => {
            this.setState({ login: false });
          }}
        />
      </header>
    );
  }
}
