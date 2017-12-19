import React from "react";
import axios from "axios";
import extend from "extend";
import { Modal, message } from "antd";
import qs from "qs";

const DURATION = 1.5;

function ajax(o) {
  let promise;
  if (o.global !== false) {
    o = extend(
      {
        method: "get",
        type: "json"
      },
      o
    );
  }
  if (o.method == "get") {
    promise = axios(o.url, { params: o.data });
  } else {
    promise = axios(o);
  }

  if (o.global !== false) {
    return promise
      .then(res => {
        const data = res.data || {};
        if (data.code !== undefined && data.code != 1) {
          switch (data.code) {
            case 900000:
            case 900001:
            case 900007:
            case 900008:
              if (!(window && window.goLogin)) {
                window ? (window.goLogin = true) : null;
                message.error(data.message, DURATION, () => {
                  window ? (window.goLogin = false) : null;
                  location.href = "/login";
                  // window.APP.props.history.replace('/login')
                });
              }
              return;
            default:
              o.errorHandle ? o.errorHandle(data) : message.error(data.message,DURATION);
          }
        }
        return data;
      })
      .catch(function(error) {
        console.log("error", error);
        if (error.response) {
          if (error.response.data) {
            const data = error.response.data;
            switch (data.code) {
              case 900000:
              case 900001:
              case 900007:
              case 900008:
                if (!(window && window.goLogin)) {
                  window ? (window.goLogin = true) : null;
                  console.log('DURATION',DURATION)
                  console.log(new Date())
                  message.warning(data.message, DURATION, () => {
                    console.log(new Date())
                    window ? (window.goLogin = false) : null;
                    location.href = "/login";
                    // window.APP.props.history.replace('/login')
                  });
                }
                return;
              default:
                o.errorHandle
                  ? o.errorHandle(data)
                  : message.error(data.message, DURATION);
            }
            return data;
          }
          // The request was made and the server responded with a status code that falls
          // out of the range of 2xx console.log(error.response.data);
          // console.log(error.response.status); console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received `error.request` is an
          // instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
        }
      });
  } else {
    return promise;
  }
}
ajax.get = (url, data, option = {}) => {
  const o = extend(
    {
      url: "/api" + url,
      data,
      method: "get"
    },
    option
  );
  return ajax(o);
};
ajax.post = (url, data, option = {}) => {
  const o = extend(
    {
      url: "/api" + url,
      data: qs.stringify(data),
      method: "post"
    },
    option
  );
  return ajax(o);
};
export default ajax;
