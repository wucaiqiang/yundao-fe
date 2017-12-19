import ajax from "../../lib/ajax";

export default class Receipt {
  checkExist(model) {
    return ajax.get("/receipt/plan/check_name_exist", model);
  }
  checkExistForUpdate(model) {
    return ajax.get("/receipt/plan/check_name_exist_for_update", model);
  }
  searchProduct(model) {
    return ajax.get("/product/get_select_option_for_receipt", model);
  }
  get(id) {
    return ajax.get("/receipt/plan/get", { id });
  }

  getSupplier(id) {
    return ajax.get("/receipt/plan/detail/get_supplier", {
      id
    });
  }
  /**
   * 新增回款计划
   *
   * @param {any} data
   * @returns R
   * @memberof receipt
   */
  add(model) {
    return ajax.post("/receipt/plan/add", model);
  }
  update(model) {
    return ajax.post("/receipt/plan/update", model);
  }
  /**
   * 删除回款计划
   *
   * @param {any} ids
   * @returns
   * @memberof Receipt
   */
  delete(ids) {
    return ajax.post("/receipt/plan/delete", {
      ids: ids.join(",")
    });
  }

  /**
   * 新增回款记录
   *
   * @param {any} data
   * @returns R
   * @memberof receipt
   */
  addRecord(model) {
    return ajax.post("/receipt/record/add", model);
  }
  /**
   * 删除回款记录
   *
   * @param {any} ids
   * @returns
   * @memberof Receipt
   */
  delRecord(ids) {
    return ajax.post("/receipt/record/delete", {
      ids: ids.join(",")
    });
  }

  /**
   * 获取可回款的报单
   *
   * @param {any} productId
   * @returns
   * @memberof Receipt
   */
  getDeclaration(productId) {
    return ajax.get("/receipt/record/get_can_receipt_declarations", {
      productId
    });
  }

  /**
   * 新增关联报单
   *
   * @param {any} data
   * @returns R
   * @memberof receipt
   */
  addDeclaration(model) {
    return ajax.post("/receipt/plan/add_declaration_rel", model);
  }

  /**
   * 删除关联报单
   *
   * @param {any} ids
   * @returns
   * @memberof Receipt
   */
  delDeclaration(ids) {
    return ajax.post("/receipt/plan/delete_declaration_rel", {
      ids: ids.join(",")
    });
  }
}
