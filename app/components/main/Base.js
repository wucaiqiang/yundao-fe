import React, {Component} from "react";

// import Storage from "../../lib/storage"; import utils from "../../utils/";
// import Permission from '../permission'

export default class Base extends React.Component {
  state = {
    login: false
  };
  constructor(props, context) {
    super(props, context);

  }
  ajax = (request, data) => {
    console.log('this.props',this.props)
    return request(data).then(res => {
      if (res.code !== undefined && res.code != 1) {
        switch (data.code) {
          case 900000:
          case 900001:
          case 900007:
            if (!(window && window.goLogin)) {
              window
                ? window.goLogin = true
                : null
              message.error(data.message, DURATION, () => {
                window
                  ? window.goLogin = false
                  : null
                location.href = "/login";
              });
            }
            return;
          default:
            o.errorHandle
              ? o.errorHandle(data)
              : message.error(data.message);
        }
      }
      return res
    })
  }

}
