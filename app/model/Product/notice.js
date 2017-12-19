import ajax from "lib/ajax";

export default class Notice {
  gets() {
    return ajax.get("/product/notice/get_page");
  }
  get(model) {
    return ajax.get("/product/notice/get", model);
  }
  add(model) {
    return ajax.post("/product/notice/add", model);
  }
  edit(model) {
    return ajax.post("/product/notice/update", model);
  }
  delete(ids) {
    return ajax.post("/product/notice/delete", { ids });
  }
  flow(model) {
    return ajax.post("/product/notice/flow", model);
  }
  sub_flow(model) {
    return ajax.post("/product/notice/sub_flow", model);
  }
  clear_flow(model) {
    return ajax.post("/product/notice/clear_flow", model);
  }
  get_product(params) {
    return ajax.get("/product/get_select_option_list", params);
  }
  auditRecord(noticeId) {
    return ajax.get("/product/notice/get_history_audit_detail", {
      noticeId
    });
  }
}
