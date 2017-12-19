import ajax from "lib/ajax";

export default class News {
  
  /**
   * 添加推荐
   *
   * @param {Object} model
   * @returns
   * @memberof News
   */
  add(model) {
    return ajax.post("/roadshow/add", model);
  }
  /**
   * 删除推荐
   *
   * @param {Number} id
   * @returns
   * @memberof News
   */
  delete(ids) {
    return ajax.post("/roadshow/delete", {ids});
  }
  /**
   * 查询推荐
   *
   * @param {Number} id
   * @returns
   * @memberof News
   */
  get(id) {
    return ajax.get("/roadshow/get", {id});
  }
  /**
   * 更新推荐
   *
   * @param {Object} model
   * @returns
   * @memberof News
   */
  update(model) {
    return ajax.post("/roadshow/update", model);
  }
  /**
   * 分页列表
   *
   * @param {Number} id
   * @returns
   * @memberof News
   */
  get_page() {
    return ajax.get("/roadshow/get_page");
  }
}