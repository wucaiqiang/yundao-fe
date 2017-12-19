import ajax from "lib/ajax";

export default class Fund {
  /**
   * 新增回退管理(基金里)
   * @param {Object} model
   */
  add(model) {
    return ajax.post("/assets/withdrawal/add", model);
  }
  /**
   * 新增回退管理(需要选择基金)
   * @param {Object} model
   */
  add_fund(model) {
    return ajax.post("/assets/withdrawal/add_fund", model);
  }

  /**
   * 删除回退管理
   * @param {String} ids
   */
  delete(id) {
    return ajax.post("/assets/withdrawal/delete", { id });
  }
  /**
   * 修改回退管理
   * @param {Object} model
   */
  update(model) {
    return ajax.post("/assets/withdrawal/update", model);
  }
  /**
   * 获取退出管理
   * @param {Object} model
   */
  get_page(model) {
    return ajax.get("/assets/withdrawal/get_page", model);
  }
  /**
   * 获取退出管理
   * @param {Object} model
   */
  get_fund_page(model) {
    return ajax.get("/assets/withdrawal/get_fund_page", model);
  }
}
