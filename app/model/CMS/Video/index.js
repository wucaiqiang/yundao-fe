import ajax from "lib/ajax";

export default class Video {
  
  /**
   * 添加视频
   *
   * @param Number fileId
   * @returns
   * @memberof Video
   */
  add(model={fileId}) {
    return ajax.post("/video/add", model);
  }
  /**
   * 获取视频详情
   *
   * @param Number id
   * @returns
   * @memberof Video
   */
  get(id) {
    return ajax.get("/video/get", {id});
  }
  /**
   * 编辑视频
   *
   * @param Number fileId
   * @returns
   * @memberof Video
   */
  update(model={id,name}) {
    return ajax.post("/video/update", model);
  }
  /**
   * 获取上传签名
   *
   * @returns
   * @memberof Video
   */
  getSignature() {
    return ajax.get('/video/get_upload_signature')
  }
  /**
   * 删除推荐
   *
   * @param {Number} id
   * @returns
   * @memberof Video
   */
  delete(ids) {
    return ajax.post("/video/delete", {ids});
  }
   /**
   * 重新转码
   *
   * @param {Number} id
   * @returns
   * @memberof Video
   */
  transcode(ids) {
    return ajax.post("/video/convert", {ids});
  }
  /**
   * 根据名称搜索
   *
   * @param {Number} id
   * @returns
   * @memberof Video
   */
  gets_by_name(name) {
    return ajax.get("/video/gets_by_name", {name});
  }
}