import ajax from "lib/ajax";

export default class Operation {
  /**
   * 回访
   *
   * @param {Object} data
   * @returns
   * @memberof Operation
   */
  allot(data) {
    return ajax.post("/user/visit/do", data);
  }
}
