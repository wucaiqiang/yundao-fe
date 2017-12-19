import ajax from "lib/ajax";

export default class Recommend {
  
  /**
   * 添加推荐
   *
   * @param {Object} model
   * @returns
   * @memberof Recommend
   */
  add(model) {
    return ajax.post("/cms/product/recommend/add", model);
  }
  /**
   * 删除推荐
   *
   * @param {Number} id
   * @returns
   * @memberof Recommend
   */
  delete(ids) {
    return ajax.post("/cms/product/recommend/delete", {ids});
  }
  /**
   * 添加推荐
   *
   * @param {Number} id
   * @returns
   * @memberof Recommend
   */
  get(id) {
    return ajax.get("/cms/product/recommend/get", {id});
  }
  /**
   * 添加推荐
   *
   * @param {Object} model
   * @returns
   * @memberof Recommend
   */
  update(model) {
    return ajax.post("/cms/product/recommend/update", model);
  }
}