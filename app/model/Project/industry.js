import ajax from "../../lib/ajax";

export default class Industry {
  gets() {
    return ajax.get("/assets/project/industry/gets");
  }
  add(model) {
    return ajax.post("/assets/project/industry/add", model);
  }
  edit(model) {
    return ajax.post("/assets/project/industry/update", model);
  }
  delete(id) {
    return ajax.post("/assets/project/industry/delete", { id });
  }
}
