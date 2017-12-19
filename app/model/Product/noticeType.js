import ajax from "lib/ajax";

export default class NoticeType {
  gets() {
    return ajax.get("/product/noticetype/get_all");
  }
  add(model) {
    return ajax.post("/product/noticetype/add", model);
  }
  delete(model) {
    return ajax.post("/product/noticetype/delete", model);
  }
}
