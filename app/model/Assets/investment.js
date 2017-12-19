import ajax from "lib/ajax";

export default class Investment {
  /**
   * 投资管理分页列表
   * @param {Object} model
   */
  get_page(model) {
    return ajax.get("/assets/investment/get_page", model);
  }
  /**
   * 基金中的投资管理列表
   * @param {Object} model
   */
  get_fund_page(model) {
    return ajax.get("/assets/investment/get_fund_page", model);
  }
  /**
   * 新增
   * @param {Object} model
   */
  add(model) {
    return ajax.post("/assets/investment/add", model);
  }
  /**
   * 基金中的投资管理新增
   */
  add_fund(model) {
    return ajax.post("/assets/investment/add_fund", model);
  }
  /**
   * 删除
   * @param {String} ids
   */
  delete(id) {
    return ajax.post("/assets/investment/delete", { id });
  }
  /**
   * 更新
   * @param {Object} model
   */
  update(model) {
    return ajax.post("/assets/investment/update", model);
  }

  get_project(name) {
    return ajax.get("/assets/project/get_select", { name });
  }
}
