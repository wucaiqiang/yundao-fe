import ajax from "lib/ajax";

export default class Declaration {
  add(data) {
    return ajax.post("/declaration/add", data);
  }
  center_add(data) {
    return ajax.post("/declaration/pc_add", data);
  }
  declaration_patch(data) {
    return ajax.post("/declaration/patch", data);
  }
  appint_add(data) {
    return ajax.post("/reservation/submit_declaration", data);
  }
  get_detail(id) {
    return ajax.get("/declaration/get", { id });
  }
  /**
   * 获取资料不完善信息
   * @param {Int} id 
   */
  validate(id) {
    return ajax.post(
      "/declaration/validate",
      { id },
      {
        errorHandle: function(params) {}
      }
    );
  }
  cancel(data) {
    return ajax.post("/declaration/cancel", data);
  }
  submit(id) {
    return ajax.post(
      "/declaration/submit",
      { id },
      {
        errorHandle: function(params) {}
      }
    );
  }
  resubmit(data) {
    return ajax.post("/declaration/resubmit", data);
  }
  refund(data) {
    return ajax.post("/declaration/apply_refund", data);
  }
  update_credentials(data) {
    return ajax.post("/declaration/update_credentials", data);
  }
  update_subscribe(data) {
    return ajax.post("/declaration/update_subscribe", data);
  }
  update_bank(data) {
    return ajax.post("/declaration/update_bank", data);
  }
  update_compliance(data) {
    return ajax.post("/declaration/update_compliance", data);
  }
  audit(data) {
    return ajax.post("/declaration/audit/do", data);
  }
  discard(data) {
    return ajax.post("/declaration/audit/discard", data);
  }
  audit_record(data) {
    return ajax.get("/declaration/audit/gets_audit_record", data);
  }
}
