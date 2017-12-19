import React from "react";
import { Tree, message, Checkbox, Radio } from "antd";
import ClassNames from "classnames";

import Base from "../../../components/main/Base";

import Resource from "../../../model/Resource/";

import style from "./roleResource.scss";

const TreeNode = Tree.TreeNode;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class RoleResource extends Base {
  state = {
    roleId: null,
    checkedKeys: [],
    treeNodes: [],
    loading: true
  };
  componentWillMount() {
    this.resource = new Resource();
  }
  componentDidMount() {
    const roleId = this.props.role.id;
    this.loadData(roleId);
  }
  componentWillReceiveProps(nextProps) {
    const roleId = this.props.role.id;
    if (nextProps.role.id !== roleId) {
      this.loadData(nextProps.role.id);
    }
  }
  loadData = id => {
    this.setState({ loading: true });
    this.resource.getByRoleId(id).then(res => {
      if (res.success) {
        const checkedKeys = [];
        const data = res.result;
        const allAuth = {};

        let tabActiveKey = null;
        if (data && data.length > 0) {
          tabActiveKey = data[0].code;
        }

        const loop = data =>
          data.map(item => {
            if (item.check === 1) {
              checkedKeys.push(item.id.toString());
            }
            if (item.childs && item.childs.length > 0) {
              loop(item.childs);
            }
            allAuth[item.code] = item;
          });

        //遍历得到 默认的 checkedKeys
        loop(data);

        this.setState({
          checkedKeys,
          tabActiveKey,
          data,
          allAuth,
          loading: false
        });
      }
    });
  };

  findSiblings =(code)=>{
    let parentItem =null
    const findDist = (childs, dist) => {
        let index = 0;
        while (index < childs.length) {
            const child = childs[index];
            if (child.childs && child.childs.length) {

              if (child.id == dist) {
                parentItem= child
                break;
              } else {
                 findDist(child.childs, dist);
              }
            }else if (child.id == dist) {
              parentItem =  child
              break;
            }
          index++;
        }
    };
    const allDom = this.state.data;
    findDist(allDom,code)
    return parentItem && parentItem.childs?parentItem.childs.filter(item=>item.id != code):[]
  }

  checkboxChange = (checked, item, callback) => {
    // if (this.props.role.isSystem) {
    //   //系统默认的角色 不可编辑
    //   return false;
    // }
    let checkedKeys = [];
    const currentCheckedKeys = this.state.checkedKeys;
    const allDom = this.state.data;

    //子节点  反选自己
    if (checked) {
      //选自己
      checkedKeys = currentCheckedKeys.concat([item.id.toString()]);

      //选择自己所有直系上级
      this.findDist = false;
      const parentIds = [];
      this.findParent(allDom, parentIds, item.id.toString());

      checkedKeys = checkedKeys.concat(parentIds);
    } else {
      //反选自己
      checkedKeys = currentCheckedKeys.filter(
        checked => item.id.toString() != checked
      );

      //假如同级的都没有选中
      //反选上级

       //选择自己所有直系上级
      //  this.findDist = false;
      //  const parentIds = [];
      //  this.findParent(allDom, parentIds, item.id.toString());
      //  parentIds.pop()

      //  parentIds.reverse().map(parent=>{
      //  const siblings  =this.findSiblings(parent)
      // const siblingsChecked=  siblings.map(item=>item.id).filter(item=>checkedKeys.indexOf(item.toString()) != -1)
      //  if(siblings && siblingsChecked.length == 0){
      //   checkedKeys = checkedKeys.filter(
      //     checked => checked!= parent
      //   );
      //  }
      // })
    }

    if (item.childs) {
      //子节点  反选自己的所有下属 先遍历出所有的子节点
      const allChildDom = [];
      const loop = data =>
        data.map(item => {
          allChildDom.push(item.id.toString());
          if (item.childs && item.childs.length > 0) {
            loop(item.childs);
          }
        });
      loop(item.childs);
      if (checked) {
        //选中直系下属
        checkedKeys = checkedKeys.concat(allChildDom);
      } else {
        //反选所有直系下属
        checkedKeys = checkedKeys.filter(
          checked => allChildDom.indexOf(checked) == -1
        );
      }
    }

    this.setState(
      {
        checkedKeys: [...new Set(checkedKeys)]
      },
      callback
    );
  };

  findParent = (childs, path, dist) => {
    if (!this.findDist) {
      var index = 0;
      while (index < childs.length) {
        if (!this.findDist) {
          const child = childs[index];
          if (child.childs && child.childs.length) {
            if (child.id.toString() == dist) {
              path.push(child.id.toString());
              this.findDist = true;
              break;
            } else {
              path.push(child.id.toString());
              this.findParent(child.childs, path, dist);
            }
          }
          if (child.id.toString() == dist) {
            path.push(child.id.toString());
            this.findDist = true;
            break;
          } else if (index == childs.length - 1 && !this.findDist) {
            path.pop();
          }
        }
        index++;
      }
    }
  };
  handleSave() {
    let { checkedKeys } = this.state;

    let model = {
      roleId: this.props.role.id,
      resourceIds: checkedKeys.join(",")
    };

    this.resource.updateByRoleId(model).then(res => {
      if (res.success) {
        message.success("角色功能权限更新保存成功");
      }
    });
  }

  handleSpecialSeaction = (checked, item) => {
    //相关功能权限的关联选择
    if (this.props.role.isSystem) {
      message.error("系统管理员权限不可编辑");
      //系统默认的角色 不可编辑
      return false;
    }
    const { allAuth } = this.state;
    if (item.code == "product.center.reservation") {
      message.success(
        `我的预约-新增预约权限同步${checked == true ? "勾选" : "取消"}`
      );
      const item = allAuth["sale.appointment.add"];
      this.checkboxChange(checked, item);
    }
    if (item.code == "sale.appointment.add") {
      message.success(
        `产品中心-预约权限同步${checked == true ? "勾选" : "取消"}`
      );
      const item = allAuth["product.center.reservation"];
      this.checkboxChange(checked, item);
    }

    if (item.code == "product.center.declaration") {
      message.success(
        `报单-新增报单权限同步${checked == true ? "勾选" : "取消"}`
      );
      const item = allAuth["sale.declaration.add"];
      this.checkboxChange(checked, item);
    }
    if (item.code == "sale.declaration.add") {
      message.success(
        `产品中心-报单权限同步${checked == true ? "勾选" : "取消"}`
      );
      const item = allAuth["product.center.declaration"];
      this.checkboxChange(checked, item);
    }
  };

  onChange = e => {
    this.setState({ tabActiveKey: e.target.value });
  };
  /**
   * 构建权限树节点
   *
   * @param {Array} data
   * @memberof RoleResource
   */
  renderTreeNodes(data) {
    const { checkedKeys } = this.state;
    const { isSystem } = this.props.role;

    const loop = data => {
      return data.map(item => {
        //预置管理员角色，系统管理权限不可编辑
        const disabled =
          isSystem && item.code.indexOf("system") > -1 ? true : false;
        const checked =
          checkedKeys.indexOf(item.id.toString()) != -1 ? true : false;

        if (item.childs && item.childs.length > 0) {
          return (
            <TreeNode
              key={item.id.toString()}
              title={
                <div
                  onClick={e => {
                    if (disabled) return;
                    e.stopPropagation();
                    e.preventDefault();

                    this.checkboxChange(!checked, item);
                  }}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    value={item.id.toString()}
                  >
                    {item.name}
                  </Checkbox>
                </div>
              }
            >
              {loop(item.childs)}
            </TreeNode>
          );
        } else {
          return (
            <TreeNode
              className={item.parentId != 0 ? "no_expand" : null}
              key={item.id.toString()}
              title={
                <div
                  onClick={e => {
                    if (disabled) return;

                    e.stopPropagation();
                    e.preventDefault();
                    this.checkboxChange(!checked, item);
                  }}
                >
                  <Checkbox
                    disabled={disabled}
                    checked={checked}
                    value={item.id.toString()}
                  >
                    {item.name}
                  </Checkbox>
                </div>
              }
            />
          );
        }
      });
    };

    return loop(data);
  }

  render() {
    let { loading, data, tabActiveKey } = this.state;

    return loading ? null : (
      <div className={style.body}>
        <div className={style.tabs}>
          <div className={style.tabs_bar}>
            <RadioGroup
              onChange={this.onChange}
              size="large"
              defaultValue={data[0].code}
            >
              {data &&
                data.map(item => {
                  return (
                    <RadioButton key={item.code} value={item.code}>
                      {item.name}
                    </RadioButton>
                  );
                })}
            </RadioGroup>
          </div>

          <div className={style.tabs_content}>
            {data &&
              data.map(item => {
                return (
                  <div
                    className={ClassNames(style.tabs_content_pane, {
                      [style.show]: tabActiveKey === item.code
                    })}
                    key={item.code}
                  >
                    <Tree
                      autoExpandParent={true}
                      defaultExpandAll={true}
                      checkStrictly={true}
                    >
                      {this.renderTreeNodes(item.childs)}
                    </Tree>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}
