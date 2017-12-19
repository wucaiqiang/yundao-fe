import ajax from "lib/ajax";

export default class Refund {
  cancel(model) {
    return ajax.post("/refund/cancel", model);
  }
  resubmit(model) {
    return ajax.post("/refund/resubmit", model);
  }
  audit(data) {
    return ajax.post("/refund/audit/do", data);
  }
  auditRecord(id) {
    return ajax.get("/workflow/get_audit_record", {
      id,
      code: "refund"
    });
  }
}
