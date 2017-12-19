import ajax from "../../lib/ajax";

export default class Resource {
  /**
   * 查询角色功能权限
   *
   * @param {any} roleId
   * @returns
   * @memberof Role
   */
  getByRoleId(roleId) {
    return ajax.get("/resource/get_by_role_id", { roleId: roleId });
  }
  /**
   * 更新角色功能权限
   *
   * @param {any} params
   * @returns
   * @memberof Resource
   */
  updateByRoleId(params) {
    return ajax.post("/resource/update_by_role_id", params);
  }

  get_role_data_auth(roleId){
    return ajax.get("/data/object/gets", {
      roleId
    });
  }
  update_role_data_auth(data){
    return ajax.post("/data/object/update",data);
  }
}
