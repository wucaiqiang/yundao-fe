import ajax from "../../lib/ajax";

class Product {
  get_fields(typeId) {
    return ajax.get("/product/get_fields", {
      typeId
    });
  }
  add(data) {
    return ajax.post("/product/add", data);
  }
  update_base(data) {
    return ajax.post("/product/base/update", data);
  }
  update_status(data) {
    return ajax.post("/product/update_status", data);
  }
  del(data) {
    return ajax.post("/product/delete", data);
  }
  audit(data) {
    return ajax.post("/product/control/audit/do", data);
  }
  auditRecord(productId) {
    return ajax.get("/product/control/audit/get_history_audit_detail", {
      productId
    });
  }
  update_base(data) {
    return ajax.post("/product/base/update", data);
  }
  update_sale(data) {
    return ajax.post("/product/sale/update", data);
  }
  update_quotation(data) {
    return ajax.post("/product/supplier_quotation/update", data);
  }
  update_commission(data) {
    return ajax.post("/product/commission/update", data);
  }
  update_income(data) {
    return ajax.post("/product/income/update", data);
  }
  focus(ids) {
    return ajax.post("/product/focus", {
      ids: ids.join(",")
    });
  }
  un_focus(ids) {
    return ajax.post("/product/cancel_focus", {
      ids: ids.join(",")
    });
  }
  get_detail(id) {
    return ajax.get("/product/get_detail_by_id", {
      id
    });
  }
  
  attach_add(model) {
    return ajax.post("/product/attach/add", model);
  }
  attach_update(model) {
    return ajax.post("/product/attach/update", model);
  }
  attach_delete(id) {
    return ajax.post("/product/attach/delete", { id });
  }
  get_product(name) {
    return ajax.get("/product/get_select_option_list", {
      name
    });
  }
  /**
   * 获取能预约的产品
   *
   * @param {any} params
   * @returns
   * @memberof Notice
   */
  get_appointment_product(name) {
    return ajax.get("/product/get_select_option_selling", { name });
  }
  /**
   * 获取能预约的产品
   *
   * @param {any} params
   * @returns
   * @memberof Notice
   */
  get_declaration_product(name) {
    return ajax.get("/product/get_select_option_for_declaration", { name });
  }
}

export default Product;
