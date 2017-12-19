import ajax from "lib/ajax";

export default class Dictionary {
  gets(codes) {
    return ajax.get("/dictionary/gets",{codes});
  }
}
