import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { matchRoutes } from "react-router-config";
import { Form, Icon, Row, Input, Button, message } from "antd";
import Base from "../components/main/Base";
import Page from "../components/main/Page";

import routes from "../routes";

import utils from "../utils";

import Auth from "../model/Auth";

import style from "./Login.scss";

import Storage from "lib/storage";

const FormItem = Form.Item;

const findFirstLeaf = menu => {
  if (menu.childs && menu.childs.length) {
    return findFirstLeaf(menu.childs[0]);
  } else {
    return menu;
  }
};

class LoginForm extends Base {
  state = {
    login: false,
    logining: false
  };
  componentWillMount() {
    this.height = window.innerHeight;
    this.auth = new Auth();
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.logining) {
          return;
        }
        this.setState({ logining: true });
        utils.setStorage("mobile", values.userName);
        this.auth.login(values).then(res => {
          this.setState({
            logining: false
          });

          if (res && res.success && res.result) {
            const { menu, onceEditPwd } = res.result;
            window.APP.setState({
              menu: menu
            });
            if (menu && menu.length) {
              let redirection = null;
              // const session = new Storage('session')
              redirection = onceEditPwd
                ? findFirstLeaf(menu[0]).path
                : "/once_password";
              this.props.history.replace(redirection);
            } else {
              message.error("该账号尚未配置任何权限，请联系系统管理员");
            }
            return;
          }
        });
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { history, location, match } = this.props;
    const matched = matchRoutes(routes, location.pathname);

    const userInfo = utils.getStorage("userInfo") || {};

    return (
      <Page {...this.props} route={matched[0].route}>
        <div
          className={style.body}
          style={{
            height: this.height
          }}
        >
          <Row
            type="flex"
            className={style.content}
            justify="center"
            align="middle"
          >
            <Form onSubmit={this.handleSubmit} className={style.form}>
              <h1 className={style.title}>欢迎登录云道</h1>
              <div className={style.caption} />
              <div className={style.formitem}>
                <FormItem>
                  {getFieldDecorator("userName", {
                    initialValue: utils.getStorage("mobile"),
                    validateTrigger: ["onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入手机号码"
                      }
                    ]
                  })(
                    <Input placeholder="手机号码" autoComplete="new-password" />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator("password", {
                    initialValue: "",
                    validateTrigger: ["onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入密码!"
                      }
                    ]
                  })(
                    <Input
                      type="password"
                      placeholder="密码"
                      autoComplete="new-password"
                    />
                  )}
                </FormItem>
                <FormItem>
                  <Button
                    loading={this.state.logining}
                    type="primary"
                    htmlType="submit"
                    className={style.btnSubmit}
                  >
                    登录
                  </Button>
                </FormItem>
              </div>
              <div className={style.links}>
                <Link to={"/forgot"}>忘记密码?</Link>
              </div>
            </Form>
          </Row>
          <div className={style.footer}>
            <img src="/assets/images/login/logo@1x.png" />
          </div>
        </div>
      </Page>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(LoginForm);

function Mod(props) {
  return <WrappedNormalLoginForm {...props} />;
}

export default Mod;
