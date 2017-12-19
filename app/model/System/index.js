import ajax from "../../lib/ajax";

export default class System {
  get_sale() {
    return ajax.get("/sys/conf/sale/get");
  }
  update_sale(model) {
    return ajax.post("/sys/conf/sale/update", model);
  }
}
