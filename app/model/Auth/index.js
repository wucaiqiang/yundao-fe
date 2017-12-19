import ajax from "../../lib/ajax";
import extend from "extend";
import utils from "../../utils/";

class Auth {
  get_menu() {
    return ajax.get("/resource/get_menu");
  }
  getCode() {
    return ajax.get('/user/get_key_public')
  }

  rsa(str, data) {
    return require.ensure(['../../lib/rsa'], function () {
      const RSAUtils = require('../../lib/rsa')
      const key = RSAUtils.getKeyPair(data.exponent, '', data.modulus);
      if (data.random) {
        str = str + ',' + data.random
      }
      return RSAUtils.encryptedString(key, str);
    })
  }
  login(data) {
    data = JSON.parse(JSON.stringify(data))

    return this
      .getCode()
      .then(res => {
        if (!res || !res.success) {
          return;
        }
        return this
          .rsa(data.password, res.result)
          .then(str => {
            data.password = str
            return ajax
              .post("/user/login", data)
              .then(res => {
                if (res && res.success) {
                  const {
                    auth,
                    menu,
                    ...others
                  } = res.result
                  utils.setStorage("userInfo", others);
                  if (auth) {
                    utils.setStorage('permissions', auth.map(item => item.code).join(','))
                  }
                }
                return res;
              });
          })

      })

  }
  logout() {
    return ajax
      .post("/user/logout")
      .then(res => {
        if (res.success) {
          utils.setCookie("ticket", "", -1);
        }
        return res;
      });
  }
  
}

export default Auth;
