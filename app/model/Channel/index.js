import ajax from "lib/ajax";

export default class Channel {
  get(id) {
    return ajax.get("/channel/get", { id });
  }
  focus(ids) {
    return ajax.post("/channel/focus", { ids: ids.join(",") });
  }
  unfocus(ids) {
    return ajax.post("/channel/clear_focus", { ids: ids.join(",") });
  }
  /**
   * 新增渠道
   * @param {Object} model
   */
  add(model) {
    return ajax.post("/channel/add", model);
  }
  /**
   * 分配
   * @param {Object} model
   */
  allot(model) {
    return ajax.post("/channel/allot", model);
  }
}
