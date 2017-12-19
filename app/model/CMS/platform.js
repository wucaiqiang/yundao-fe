import ajax from "lib/ajax";

export default class Platform {
  /**
   * 查询所有平台
   *
   * @param {Object} model
   * @returns
   * @memberof Recommend
   */
  get_platform() {
    return ajax.get("/platform/get_all");
  }
  /**
   * 查询PC WEB 平台
   *
   * @param {Object} model
   * @returns
   * @memberof Recommend
   */
  get_platform_web() {
    return ajax.get("/platform/get_web");
  }
  /**
   * 查询路演 平台
   *
   * @param {Object} model
   * @returns
   * @memberof Recommend
   */
  get_platform_roadshow() {
    return ajax.get("/platform/get_roadshow_platform");
  }
  /**
   * 查询路演平台
   *
   * @param {Object} model
   * @returns
   * @memberof Recommend
   */
  get_roadshow_platform() {
    return ajax.get("/platform/get_roadshow_platform");
  }
  /**
   * 删除推荐
   *
   * @param {Number} id
   * @returns
   * @memberof Recommend
   */
  get_position_by_platform(platformId) {
    return ajax.get("/platform/get_position_by_platform", { platformId });
  }
}
