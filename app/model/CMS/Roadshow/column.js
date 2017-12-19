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
    return ajax.post("/roadshow/column/add", model);
  }
  /**
   * 删除推荐
   *
   * @param {Number} id
   * @returns
   * @memberof News
   */
  delete(ids) {
    return ajax.post("/roadshow/column/delete", {ids});
  }
  /**
   * 查询推荐
   *
   * @param {Number} id
   * @returns
   * @memberof News
   */
  get(id) {
    return ajax.get("/roadshow/column/get", {id});
  }
  /**
   * 更新推荐
   *
   * @param {Object} model
   * @returns
   * @memberof News
   */
  update(model) {
    return ajax.post("/roadshow/column/update", model);
  }
  /**
   * 获取分页
   *
   * @param {Object} model
   * @returns
   * @memberof News
   */
  get_page() {
    return ajax.get("/roadshow/column/get_page" );
  }
  /**
   * 更新推荐
   *
   * @param {Object} model
   * @returns
   * @memberof News
   */
  get_platform_column(platformId) {
    return ajax.get("/roadshow/column/get_by_platform_id", {platformId});
  }
}