import ajax from "../../lib/ajax";

import RSAUtils from "../../lib/rsa";

export default class User {
  sitting() {}
  dimission(ids) {
    return ajax.post("/user/cease", {
      ids: ids.join(",")
    });
  }
  enabled(ids) {
    return ajax.post("/user/enabled", {
      ids: ids.join(",")
    });
  }
  enabled;
  getCode() {
    return ajax.get("/user/get_key_public");
  }
  add = data => {
    console.log(this);
    data = JSON.parse(JSON.stringify(data));
    if (data.password) {
      //新增员工  初始化密码 进行密码加密
      return this.getCode(data.mobile).then(res => {
        console.log("res", res);
        if (!res || !res.success) return;
        let pwd = data.password;
        const key = RSAUtils.getKeyPair(
          res.result.exponent,
          "",
          res.result.modulus
        );
        if (res.result.random) {
          pwd = pwd + "," + res.result.random;
        }
        data.password = RSAUtils.encryptedString(key, pwd);
        return ajax.post("/user/add", data);
      });
    } else {
      return ajax.post("/user/add", data);
    }
  };
  edit(data) {
    return ajax.post("/user/modify", data);
  }
  check_mobile(mobile) {
    return ajax.get(
      "/user/check_mobile_exist",
      { mobile },
      {
        errorHandle: err => {
          console.log(err);
        }
      }
    );
  }
  get_users() {
    return ajax.get("/user/get_users");
  }
  check_job_number(jobNumber) {
    return ajax.get("/user/check_job_number_exist", { jobNumber });
  }
  get_users_by_realName(realName) {
    return ajax.get("/user/get_users_by_realName", { realName });
  }

  get_users_by_roleId(roleId) {
    return ajax.get("/user/get_by_role", { roleId });
  }
  get_tenants() {
    return ajax.get("/user/get_tenants");
  }
  get(id) {
    return ajax.get("/user/get_for_org", { id });
  }
  checkCanAdd() {
    return ajax.get("/user/check_can_add");
  }
  changePwd(data) {
    return ajax.post("/user/update_password", data);
  }
  sendCaptcha(mobile) {
    return ajax.post("/user/send_retrieve_captcha", { mobile });
  }
  forgotPwd(data) {
    return ajax.post("/user/retrieve_password", data);
  }
}
