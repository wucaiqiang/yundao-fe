import ajax from "../../lib/ajax";

class Commission {
  add(data={}) {
    return ajax.post('/knot/commission/add',data)
  }
  get(declarationId) {
    return ajax.get("/knot/commission/get", {
      declarationId
    });
  }
  get_record(declarationId) {
    return ajax.get("/knot/commission/get_list", {
      declarationId
    });
  }
  flow(data={}){
    return ajax.post('/knot/commission/audit',data)
  }
  get_audit_record(id) {
    return ajax.get("/workflow/get_audit_record", {
      id,
      code:'knot_commission'      
    });
  }
}

export default Commission;
