import ajax from "lib/ajax";

export default class Fund {
  /**
   * 获取详情
   *
   * @param {Int} id
   */
  get(id) {
    return ajax.get("/assets/fund/get_detail_by_id", { id });
  }
  /**
   * 获取基金类型字段
   * @param {Int} typeId
   */
  getFields(typeId) {
    return ajax.get("/assets/fund/get_fields", { typeId });
  }
  /**
   * 获取基金类型
   * @param {Int} typeId
   */
  get_selection() {
    return ajax.get("/assets/fund/get_selection");
  }
  /**
   * 新增基金
   * @param {Object} model
   */
  add(model) {
    return ajax.post("/assets/fund/add", model);
  }
  /**
   * 删除基金
   * @param {String} ids
   */
  delete(ids) {
    return ajax.post("/assets/fund/delete", { ids });
  }
  /**
   * 修改基金信息
   * @param {Object} model
   */
  baseUpdate(model) {
    return ajax.post("/assets/fund/base/update", model);
  }
  /**
   * 修改募集信息
   * @param {Object} model
   */
  raiseUpdate(model) {
    return ajax.post("/assets/fund/raise/update", model);
  }
  /**
   * 修改基金收益信息
   * @param {Object} model
   */
  update_income(model) {
    return ajax.post("/assets/fund/income/update", model);
  }

  focus(ids) {
    return ajax.post("/assets/fund/focus/do", { ids });
  }
  unfocus(ids) {
    return ajax.post("/assets/fund/focus/undo", { ids });
  }
  attach_add(model) {
    return ajax.post("/assets/fund/attach/add", model);
  }
  attach_delete(id) {
    return ajax.post("/assets/fund/attach/delete", { id });
  }
  get_connected_product(fundId) {
    return ajax.get("/assets/fund/get_raise_project", { fundId });
  }
  import_product(id) {
    return ajax.post("/assets/fund/import_product", { id });
  }

  /**
   * 修改发行状态
   * @param {Object} model
   */
  changeIssuedStatus(model) {
    return ajax.post("/assets/fund/update/issued_status", model);
  }
}
