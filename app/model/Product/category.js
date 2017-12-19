import ajax from "../../lib/ajax";

export default class Elements {
  get_page() {
    return ajax.get("/product/fieldgroup/get_page");
  }
  get_all() {
    return ajax.get("/product/fieldgroup/get_all");
  }
  get(id) {
    return ajax.get("/product/fieldgroup/get", {
      id
    });
  }
  add(data) {
    return ajax.post("/product/fieldgroup/add", data);
  }
  edit(data) {
    return ajax.post("/product/fieldgroup/update", data);
  }
  update_info(data) {
    return ajax.post("/product/fieldgroup/update_info", data);
  }
  update_rel(data) {
    return ajax.post("/product/fieldgroup/update_rel", data);
  }
  delete(ids) {
    return ajax.post("/product/fieldgroup/delete", {
      ids: ids.join(",")
    });
  }
}
