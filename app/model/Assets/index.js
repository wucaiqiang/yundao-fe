import ajax from "lib/ajax";

export default class Assets {
  /**
   * 获取详情
   *
   * @param {any} projectId
   * @returns
   * @memberof Assets
   */
  get(projectId) {
    return ajax.get("/assets/project/get", { projectId });
  }

  /**
   * 添加
   *
   * @param {any} model
   * @returns
   * @memberof Assets
   */
  add(model) {
    return ajax.post("/assets/project/add", model);
  }
  /**
   * 批量删除项目
   * @param {String} ids
   */
  delete(ids) {
    return ajax.post("/assets/project/delete", { ids });
  }
  /**
   * 更新单个字段
   *
   * @param {any} model
   * @returns
   * @memberof Assets
   */
  update_only(model) {
    return ajax.post("/assets/project/update_only", model);
  }
  /**
   * 更新多个字段
   *
   * @param {any} model
   * @returns
   * @memberof Assets
   */
  update_multiple(model) {
    return ajax.post("/assets/project/update_multiple", model);
  }

  /**
   * 文档添加
   *
   * @param {any} model
   * @returns
   * @memberof Assets
   */
  attach_add(model) {
    return ajax.post("/assets/project/file/add", model);
  }

  /**
   * 文档删除
   *
   * @param {any} id
   * @returns
   * @memberof Assets
   */
  attach_delete(id) {
    return ajax.post("/assets/project/file/delete", { id });
  }
  /**
   * 获取项目文档
   *
   * @param {any} id
   * @returns
   * @memberof Assets
   */
  get_attach(model) {
    return ajax.get("/assets/project/file/get_page", model);
  }
  /**
   * 公司信息
   *
   * @param {any} projectId
   * @returns
   * @memberof Assets
   */
  company_info(projectId) {
    return ajax.get("/assets/project/company/get", { projectId });
  }
  /**
   * 公司信息更新单个字段
   *
   * @param {any} model
   * @returns
   * @memberof Assets
   */
  company_info_update_only(model) {
    return ajax.post("/assets/project/company/update_only", model);
  }
  /**
   * 公司信息更新多个字段
   *
   * @param {any} model
   * @returns
   * @memberof Assets
   */
  company_info_update_multiple(model) {
    return ajax.post("/assets/project/company/update_multiple", model);
  }
  /**
   * 项目组员更新
   *
   * @param {any} projectId
   * @returns
   * @memberof Assets
   */
  project_crew_update(model) {
    return ajax.post("/assets/project/crew/update", model);
  }

  focus(ids) {
    return ajax.post("/assets/project/focus/do", { ids });
  }
  unfocus(ids) {
    return ajax.post("/assets/project/focus/undo", { ids });
  }

  /**
   * 获取搜索范围
   */
  getScope() {
    return ajax.get("/assets/project/get_search_scope");
  }
  /**
   * 首页报表
   */
  report() {
    return ajax.get("/assets/index/report", null, { errorHandle: () => {} });
  }
  /**
   * 首页待审批
   */
  audit() {
    return ajax.get(
      "/assets/index/audit/todo",
      { pageSize: 100000 },
      { errorHandle: () => {} }
    );
  }

  /**
   * 立项审批记录
   */
  get_decision_audit_detail(decisionId) {
    return ajax.get("/assets/index/audit_history/get_decision_detail", {
      decisionId
    });
  }
  /**
   * 项目审批记录
   */
  get_project_audit_detail(projectId) {
    return ajax.get("/assets/index/audit_history/get_project_detail", {
      projectId
    });
  }
  //融资信息
  found_get_list(model) {
    return ajax.get("/assets/project/found/get_list", model);
  }
  found_clear(id) {
    return ajax.post("/assets/project/found/clear", { id });
  }
  found_import(id) {
    return ajax.post("/assets/project/found/import", { id });
  }
  financing_add_round(model) {
    return ajax.post("/assets/project/financing/add_round", model);
  }
  financing_delete_round(id) {
    return ajax.post("/assets/project/financing/delete_round", { id });
  }
  financing_update_round(model) {
    return ajax.post("/assets/project/financing/update_round", model);
  }
  financing_add_info(model) {
    return ajax.post("/assets/project/financing/add_info", model);
  }
  financing_delete_info(id) {
    return ajax.post("/assets/project/financing/delete_info", { id });
  }
  financing_update_info(model) {
    return ajax.post("/assets/project/financing/update_info", model);
  }
  financing_get_page(model) {
    return ajax.get("/assets/project/financing/get_page", model);
  }
  get_history(projectId) {
    return ajax.get("/assets/project/decision/get_page_over", { projectId });
  }
  decision_get(id) {
    return ajax.get("/assets/project/decision/get", { id });
  }
  fund_get_selection(name) {
    return ajax.get("/assets/fund/get_selection", { name });
  }
  get_select_investment(model) {
    return ajax.get("/assets/project/get_select_investment", model);
  }
}
