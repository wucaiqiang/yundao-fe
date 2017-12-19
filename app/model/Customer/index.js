import ajax from "lib/ajax";

export default class Customer {
  focus(customerIds) {
    return ajax.post("/user/customer/v2/focus", {
      customerIds: customerIds.join(",")
    });
  }
  unfocus(customerId) {
    return ajax.post("/user/customer/unfocus", { customerId });
  }
  add(data) {
    return ajax.post("/customer/v2/add", data);
  }
  addOpensea(model) {
    return ajax.post("/customer/add_opensea", model);
  }
  addPool(model) {
    return ajax.post("/customer/add_pool", model);
  }
  update_info(data) {
    return ajax.post("/customer/update_info", data);
  }
  update_contact(data) {
    return ajax.post("/customer/update_contact", data);
  }
  update_assets(data) {
    return ajax.post("/customer/update_assets", data);
  }
  update_credentials(data) {
    return ajax.post("/customer/update_credentials", data);
  }
  update_status(data) {
    return ajax.post("/customer/update_status", data);
  }
  tag_get_customer() {
    return ajax.get("/customer/tag/get_customer_tag");
  }
  tag_get_top() {
    return ajax.get("/customer/tag/get_top");
  }
  get_detail(id) {
    return ajax.get("/customer/v2/get_detail", { id });
  }
  get_detail_from_opensea(id) {
    return ajax.get("/customer/opensea/get_detail", {
      id
    });
  }
  check_mobile(mobile) {
    return ajax.get(
      "/customer/validate_mobile",
      { mobile },
      {
        errorHandle: err => {
          console.log(err);
        }
      }
    );
  }
  follow(model) {
    return ajax.post("/customer/follow/add", model);
  }
  gets_follow(model) {
    return ajax.get("/customer/follow/get_page", model);
  }
  gets_dynamic(model) {
    return ajax.get("/msg/feed/get_customer_page", model);
  }
  get_selection(name) {
    return ajax.post("/customer/get_my_selections", {
      name
    });
  }

  /**
   * 客户放弃
   *
   * @param {Object} model
   * @returns
   * @memberof Customer
   */
  back(model) {
    return ajax.post("/customer/v2/back/apply", model);
  }
  /**
   * 回退通过/驳回
   *
   * @param {Object} model
   * @returns
   * @memberof Customer
   */
  audit(model) {
    return ajax.post("/customer/back/audit", model);
  }

  /**
   * 客户调配
   *
   * @param {Object} model
   * @returns
   * @memberof Customer
   */
  allot_to_fp(model) {
    return ajax.post("/customer/v2/distribution/allot_to_fp", model);
  }
  /**
   * 分配回访
   *
   * @param {Object} model
   * @returns
   * @memberof Customer
   */
  allot_to_cs(model) {
    return ajax.post("/customer/v2/distribution/allot_to_cs", model);
  }
  /**
   * 回收客户
   *
   * @param {Object} model
   * @returns
   * @memberof Customer
   */
  recycle(model) {
    return ajax.post("/customer/v2/distribution/recycle", model);
  }

  /**
   * 交易信息 额度预约&报单 数
   *
   * @param {any} customerId
   * @returns
   * @memberof Appoint
   */
  get_count(customerId) {
    return ajax.get("/customer/sale/gets_count", { customerId });
  }
  /**
   * 获取风险测评结果
   *
   * @param {any} customerId
   * @returns
   * @memberof Customer
   */
  getRiskEvaluationResult(customerId) {
    return ajax.get("/customer/get/risk_evaluation_result", { customerId });
  }
  /**
   * 领取公海客户
   *
   * @param {any} customerId
   * @returns
   * @memberof Customer
   */
  receive(customerId) {
    return ajax.post("/customer/opensea/receive_customer", { customerId });
  }
}
