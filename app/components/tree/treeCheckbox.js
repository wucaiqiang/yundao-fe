import React from "react";
import {Tree, message,Checkbox} from "antd";

import Resource from "../../../model/Resource/";

const TreeNode = Tree.TreeNode;

import Base from '../../../components/main/Base'

export default class TreeCheckbox extends Base {
  state = {
    roleId: null,
    checkedKeys: [],
    treeNodes: [],
    loading:true,
  };
  componentWillMount() {
    this.resource = new Resource();
  }
  componentDidMount() {
    this.loadData(this.props.roleId)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.roleId !== this.props.roleId) {
      this.loadData(nextProps.roleId)
    }
  }
  loadData = (id) => {
    this.setState({
      loading:true
    })
    this
      .resource
      .getByRoleId(id)
      .then(res => {
        if (res.success) {
          const checkedKeys =[]
          const data = res.result
           const loop = data => data.map(item => {
              if (item.check === 1) {
                  checkedKeys.push(item.id.toString());
              }
              if (item.childs && item.childs.length > 0) {
                loop(item.childs)
              }
           })

           //遍历得到 默认的 checkedKeys
          loop(data);

          this.setState({
            checkedKeys,
            data,
            loading:false
          })
        }
      });
  }

  checkboxChange=(checked,item)=>{
    console.log(`checked = ${checked}`);
    console.log(`item = ${item}`,item);
    let checkedKeys = []
    const currentCheckedKeys = this.state.checkedKeys
    const allDom = this.state.data;

    //子节点  反选自己
    if(checked){
      //选自己
      checkedKeys = currentCheckedKeys.concat([item.id.toString()])

      //选择自己所有上级
      this.findDist = false
      const parentIds = []
      this.findParent(allDom,parentIds,item.id)
      console.log('parentIds',parentIds)
      checkedKeys = checkedKeys.concat(parentIds)
    }else{
      checkedKeys = currentCheckedKeys.filter(checked=>item.id.toString() !=checked)
    }

    if(item.childs){
      //子节点  反选自己的所有下属
      //先遍历出所有的子节点
      const allChildDom = []
      const loop = data => data.map(item => {
              allChildDom.push(item.id.toString());
              if (item.childs && item.childs.length > 0) {
                loop(item.childs)
              }
          })
      loop(item.childs)
      console.log('allChildDom',allChildDom)
       if(checked){
         checkedKeys = checkedKeys.concat(allChildDom)
       }else{
         checkedKeys = checkedKeys.filter(checked=>allChildDom.indexOf(checked)==-1)
       }
    }

    this.setState({
      checkedKeys:[...new Set(checkedKeys)]
    })
  }
  /**
   * 构建权限树节点
   *
   * @param {Array} data
   * @memberof RoleResource
   */
  renderTreeNodes(data, roleId) {
    
    const {checkedKeys} = this.state
    console.log('checkedKeys',checkedKeys)
    const loop = data => data.map(item => {

      if (item.childs && item.childs.length > 0) {
        const checked = checkedKeys.indexOf(item.id.toString()) != -1 ?true:false
        console.log('checked',checked,item.id)
        return (
          <TreeNode key={item
            .id
            .toString()} title={
              <div onClick={e=>{
                this.checkboxChange(!checked,item)
                }}>
              <Checkbox  checked={checked} value={item.id.toString()}>{item.name}</Checkbox></div>
            }>
            {loop(item.childs)}
          </TreeNode>
        );
      }
      else{
          const checked = checkedKeys.indexOf(item.id.toString()) != -1 ?true:false
          return <TreeNode  className={item.parentId !=0?'no_expand':null} key={item
            .id
            .toString()} title={
              <div onClick={e=>{
                this.checkboxChange(!checked,item)
                }}>
              <Checkbox  checked={checked} value={item.id.toString()}>{item.name}</Checkbox></div>}/>;
      }
    });

    let treeNodes = loop(data);
    return treeNodes
  }
 
  findParent =(childs, path, dist)=> {
        if (!this.findDist) {
            for (var index = 0; index < childs.length; index++) {
                if (!this.findDist) {
                    const child = childs[index]
                    if (child.childs && child.childs.length) {
                        if(path.indexOf(child.id.toString()) == -1){
                          path.push(child.id.toString())
                        }
                        this.findParent(child.childs, path, dist)
                    } else {
                        if (child.id.toString() == dist) {
                            if(path.indexOf(child.id.toString()) == -1){
                              path.push(child.id.toString())
                            }
                            this.findDist = true
                        } else if (index == childs.length - 1) {
                            path.pop()
                        }
                    }
                }
            }
        }
    }
  handleSave() {
    let {checkedKeys} = this.state;
    // if(!checkedKeys || checkedKeys.length ===0) {
    // message.warning('请至少选择一项功能权限'); }



    let model = {
      roleId: this.props.roleId,
      resourceIds: checkedKeys.join(',')
    };

    this
      .resource
      .updateByRoleId(model)
      .then(res => {
        if (res.success) {
          message.success("角色功能权限更新保存成功");
        }
      });
  }
  render() {
    return this.state.loading?null:(
      <div className={style.body}>
      <Tree
        autoExpandParent={true}
        defaultExpandAll={true}
        checkStrictly={true}
        defaultExpandedKeys={this.state.checkedKeys}
        >
        {this.renderTreeNodes(this.state.data)}
      </Tree>
      </div>
    );
  }
}
