import ajax from "../../lib/ajax";

 class Elements {
  get_list() {
    //获取全部 无分页的基金产品要素
    return ajax.get("/product/element/get_list");
  }
  get(id) {
    return ajax.get("/product/element/get", {
      id
    });
  }
  add(data) {
    return ajax.post("/product/element/add", data);
  }
  edit(data) {
    return ajax.post("/product/element/update", data);
  }
  delete(ids) {
    return ajax.post("/product/element/delete", {
      ids: ids.join(",")
    });
  }
}


export default Elements