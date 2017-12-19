import ajax from "../../lib/ajax";

class Department {
  gets() {
    return ajax.get("/department/gets");
  }
  get(id) {
    return ajax.get("/department/get", {
      id
    });
  }
  edit(data) {
    return ajax.post("/department/update", data);
  }
  delete(id) {
    return ajax.post("/department/delete", {
      id
    });
  }
  add(data) {
    return ajax.post("/department/add", data);
  }
}

export default Department;
