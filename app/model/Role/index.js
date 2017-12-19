import ajax from "../../lib/ajax";

export default class Role {
  gets() {
    return ajax.get("/role/gets");
  }
  add(model) {
    return ajax.post("/role/add", model);
  }
  edit(model) {
    return ajax.post("/role/update", model);
  }
  del(id) {
    return ajax.post("/role/delete", { id });
  }
}
