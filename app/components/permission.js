import React, {Component} from "react";

import PropTypes from "prop-types";

import utils from "../utils/";


// const check = (auth)=>{
//    //权限检测存在  检查是否有权限
//    let checked = true
//    let permissionData = []
//    const permissions = utils.getStorage("permissions")
//    if (permissions) {
//      permissionData=permissionData.concat(permissions.split(','))
//    }
//    const roles = auth.split(',')
//    //遍历当前需要的权限 假如不存在 就检查不通过
//    for (var index = 0; index < roles.length; index++) {
//      var role = roles[index];
//      if (permissionData.indexOf(role) == -1) {
//        checked = false
//        break;
//      }
//    }
//    return checked
// }


export default (ComposedComponent,RefusedComponent) => class Permission extends Component {
  // 构造
  constructor(props) {
    super(props);
  }

  

  render() {

    const {auth,...others} = this.props
    if (auth &&  utils.checkPermission(auth)) {
      return ComposedComponent
    } else {
      return RefusedComponent ? RefusedComponent:null
    }
  }
};

