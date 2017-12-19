import ajax from "lib/ajax";

export default class Fund {
  /**
   * 新增团队成员
   * @param {Object} model
   */
  add(model) {
    return ajax.post("/assets/fund/team/add", model);
  }
  /**
   * 删除团队成员
   * @param {String} ids
   */
  delete(ids) {
    return ajax.post("/assets/fund/team/delete", { ids });
  }
  /**
   * 修改团队成员
   * @param {Object} model
   */
  update(model) {
    return ajax.post("/assets/fund/team/update", model);
  }
}
