import ajax from "../../lib/ajax";

export default class Decision {
  get(id) {
    return ajax.get("/assets/project/decision/get", { id });
  }
  isExist(projectId) {
    return ajax.get("/assets/project/decision/exist_not_over", { projectId });
  }
  add(model) {
    return ajax.post("/assets/project/decision/add", model);
  }
  /**
   * 获取初审意见
   * @param {Int} decisionId
   */
  gets_suggestion(decisionId) {
    return ajax.get("/assets/project/decision/suggestion/gets", { decisionId });
  }
  /**
   * 新增意见
   * @param {Object} model
   */
  add_suggestion(model) {
    return ajax.post("/assets/project/decision/suggestion/add", model);
  }
  /**
   * 修改意见
   * @param {Object} model
   */
  edit_suggestion(model) {
    return ajax.post("/assets/project/decision/suggestion/update", model);
  }
  /**
   * 删除意见
   * @param {Object} model
   */
  delete_suggestion(ids) {
    return ajax.post("/assets/project/decision/suggestion/delete", { ids });
  }

  /**
   * 投决最终决定
   * @param {Object} model
   */
  finalDecision(model) {
    return ajax.post("/assets/project/decision/invest/update", model);
  }

  add_file(model) {
    return ajax.post("/assets/project/decision/flow/add_file", model);
  }
  delete_file(id) {
    return ajax.post("/assets/project/decision/flow/delete_file", { id });
  }
  update_remark(model) {
    return ajax.post("/assets/project/decision/flow/update_remark", model);
  }
  record_download(model) {
    return ajax.post("/assets/project/record/download", model, {
      errorHandle: () => {}
    });
  }

  /**
   * 提交审批
   */
  submit(model) {
    return ajax.post("/assets/project/decision/submit", model);
  }
}
