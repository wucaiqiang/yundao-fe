import ajax from "lib/ajax";

export default class Appoint {
  add(data) {
    return ajax.post("/reservation/add", data);
  }
  center_add(data) {
    return ajax.post("/product/center/reservation", data);
  }
  update(data) {
    return ajax.post("/reservation/update", data);
  }
  get(id) {
    return ajax.get("/reservation/get", {
      id
    });
  }
  cancel(data) {
    return ajax.post("/reservation/cancel", data);
  }
  again_commit(data) {
    return ajax.post("/reservation/again_commit", data);
  }
  audit(data) {
    return ajax.post("/reservation/audit/do", data);
  }

  get_my_select(productId) {
    return ajax.get("/reservation/gets/my_select", { productId });
  }
  discard(data) {
    return ajax.post("/reservation/audit/discard", data);
  }
  audit_record(data) {
    return ajax.get("/reservation/audit/gets_audit_record", data);
  }
}
