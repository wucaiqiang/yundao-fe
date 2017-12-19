import React, { Component } from "react";
import { Link } from "react-router-dom";
import { matchRoutes } from "react-router-config";
import { Form, Icon, Input, Button, message } from "antd";

import routes from "../routes";

import Base from "../components/main/Base";
import Page from "../components/main/Page";

import utils from "../utils";

import User from "../model/User";

import style from "./Login.scss";

const FormItem = Form.Item;

class ForgotForm extends Base {
  state = {
    loading: false,
    step: 1,
    disabled: false,
    tipText: "请输入您要找回登录密码的手机号",
    btnText: "发送验证码"
  };
  componentWillMount() {
    this.user = new User();
    this.height = window.innerHeight;
  }
  componentUnMount() {
    clearInterval(this.Timer);
  }
  handleNextStep = () => {
    this.props.form.validateFields((err, values) => {
      if (err || this.state.loading) {
        return;
      }

      utils.setStorage('mobile',values.mobile)

      this.firstStepData = values;

      this.user.check_mobile(values.mobile).then(res => {
        if (res.success && res.result.commonExist) {
          this.setState({ step: 2, tipText: "" });
        } else {
          message.warning("手机号不存在!");
        }
      });
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err || this.state.loading) {
        return;
      }

      const _this = this;
      //获取密钥
      this.user.getCode().then(res => {
        if (!res.success) return;

        const { exponent, modulus, random } = res.result;

        return require.ensure(["lib/rsa"], function() {
          const RSAUtils = require("lib/rsa");
          const key = RSAUtils.getKeyPair(exponent, "", modulus);

          let pwd = values.password;
          if (random) {
            pwd = pwd + "," + random;
          }
          //加密后密码
          let password = RSAUtils.encryptedString(key, pwd);
          //post数据
          let data = Object.assign(values, _this.firstStepData, { password });

          _this.user.forgotPwd(data).then(res => {
            if (res.success) {
              message.success("密码找回成功，请使用新密码登录");

              document.getElementById("loginLink").click();
            }
          });
        });
      });
    });
  };
  /**
   * 发送验证码
   *
   * @memberof ForgotForm
   */
  handleSendCode = () => {
    this.user.sendCaptcha(this.firstStepData.mobile).then(res => {
      if (res.success) {
        this.setState({
          disabled: true,
          tipText: "验证码已发送至" + this.firstStepData.mobile
        });

        this.seconds = 59;
        this.Timer = setInterval(this.handerTimer, 1000);
      }
    });
  };
  /**
   * 倒计时定时器
   *
   * @memberof ForgotForm
   */
  handerTimer = () => {
    if (this.seconds > 1) {
      this.setState({ btnText: `${this.seconds}秒后重发` });
    } else {
      clearInterval(this.Timer);
      this.setState({ btnText: "重发验证码", disabled: false });
    }

    this.seconds = this.seconds - 1;
  };
  render() {
    const { loading, step, disabled, tipText, btnText } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { history, location, match } = this.props;
    const route = matchRoutes(routes, location.pathname);

    const userInfo = utils.getStorage("userInfo") || {};

    return (
      <Page {...this.props} route={route[0].route}>
        <div className={style.body} style={{ height: this.height }}>
          <div className={style.content}>
            <Form
              className={style.form}
              onSubmit={this.handleSubmit}
              autoComplete="off"
            >
              <h1 className={style.title}>找回密码</h1>
              <div className={style.caption}>{tipText}</div>
              {step === 1 ? (
                <div className={style.formitem}>
                  <FormItem>
                    {getFieldDecorator("mobile", {
                      initialValue: utils.getStorage('mobile'),
                      validateTrigger: ["onBlur"],
                      rules: [
                        { required: true, message: "请输入手机号码!" },
                        {
                          message: "手机号码格式错误",
                          pattern: new RegExp("^1[34578]\\d{9}$")
                        }
                      ]
                    })(<Input placeholder="手机号码" />)}
                  </FormItem>
                  <FormItem>
                    <Button onClick={this.handleNextStep}>下一步</Button>
                  </FormItem>
                </div>
              ) : (
                <div className={style.formitem}>
                  <FormItem>
                    {getFieldDecorator("captcha", {
                      rules: [{ required: true, message: "请输入收到的验证码!" }]
                    })(
                      <Input
                        placeholder="请输入收到的验证码"
                        autoComplete="new-password"
                      />
                    )}
                    <Button
                      className={style.btnCode}
                      disabled={disabled}
                      onClick={this.handleSendCode}
                    >
                      {btnText}
                    </Button>
                  </FormItem>
                  <FormItem>
                    {getFieldDecorator("password", {
                      validateTrigger: ["onBlur"],
                      rules: [
                        { required: true, message: "请输入新密码!" },
                        {
                          message: "6-20位，不能是纯字母或纯数字",
                          pattern: new RegExp(
                            "^(?![d]+$)(?![a-zA-Z]+$)(?![^da-zA-Z]+$).{6,20}$"
                          )
                        }
                      ]
                    })(
                      <Input
                        type="password"
                        placeholder="新密码"
                        autoComplete="new-password"
                      />
                    )}
                  </FormItem>
                  <FormItem>
                    <Button loading={loading} htmlType="submit">
                      确定
                    </Button>
                  </FormItem>
                </div>
              )}
              <div className={style.links}>
                想起密码?<Link className={style.login} id="loginLink" to={"/login"}>
                  直接登录
                </Link>
              </div>
            </Form>
          </div>
          <div className={style.footer}>
            <img src="/assets/images/login/logo@1x.png" />
          </div>
        </div>
      </Page>
    );
  }
}

const WrappedForgotForm = Form.create()(ForgotForm);

function Mod(props) {
  return <WrappedForgotForm {...props} />;
}

export default Mod;
