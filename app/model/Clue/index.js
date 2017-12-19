import ajax from "lib/ajax";

export default class Clue {
  /**
   * 获取回访详情
   *
   * @param {any} leadsId
   * @returns
   * @memberof Clue
   */
  getVisit(leadsId) {
    return ajax.get("/user/visit/get_detail_for_leads", { leadsId });
  }
  /**
   * 获取未分配线索
   *
   * @param {any} customerId
   * @returns
   * @memberof Clue
   */
  getUnallot(customerId) {
    return ajax.get("/leads/customer/get_unallot", { customerId });
  }
  /**
   * 分配客服回访
   *
   * @param {any} model
   * @returns
   * @memberof Clue
   */
  allot(model) {
    return ajax.post("/leads/allot", model);
  }
  /**
   *尝试分配客服回访
   *
   * @param {any} model
   * @returns
   * @memberof Clue
   */
  tryAllot(model) {
    return ajax.post("/leads/try_allot", model);
  }
  /**
   * 分配负责人
   *
   * @param {Object} model
   * @returns
   * @memberof Clue
   */
  allotFp(model) {
    return ajax.post("/leads/allot_to_fp", model);
  }
  /**
   * 销售线索处理
   *
   * @param {any} model
   * @returns
   * @memberof Clue
   */
  process(model) {
    return ajax.post("/leads/process", model);
  }
  /**
   * 线索机会 销售线索数
   *
   * @param {any} customerId
   * @returns
   * @memberof Appoint
   */
  getCount(customerId) {
    return ajax.get("/customer/detail/get_leads_chance_count", {
      customerId
    });
  }
}
