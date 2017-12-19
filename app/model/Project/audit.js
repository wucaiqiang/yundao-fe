import ajax from "../../lib/ajax";

export default class Audit {
  /**
   * 立项审批
   * @param {Object} model
   */
  audit_decisioning(model) {
    return ajax.post("/assets/project/decision/audit_decisioning", model);
  }
  /**
   * 尽职调查审批
   * @param {Object} model
   */
  audit_due_diligence(model) {
    return ajax.post("/assets/project/decision/audit_due_diligence", model);
  }
  /**
   * 初审审批
   * @param {Object} model
   */
  audit_first_trial(model) {
    return ajax.post("/assets/project/decision/audit_first_trial", model);
  }
  /**
   * 出资审批
   * @param {Object} model
   */
  audit_invest(model) {
    return ajax.post("/assets/project/decision/audit_invest", model);
  }
  /**
   * 投委会审批
   * @param {Object} model
   */
  audit_investment_commission(model) {
    return ajax.post(
      "/assets/project/decision/audit_investment_commission",
      model
    );
  }
}
