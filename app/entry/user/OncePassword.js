import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { matchRoutes } from "react-router-config";
import { Form, Icon, Input, Button, Modal } from "antd";
import Base from "components/main/Base";
import Page from "components/main/Page";

import routes from "../../routes";

import utils from "utils/";

import Auth from "model/Auth/";
import User from "model/User/";

import style from "../Login.scss";

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
    this.user = new User();
  }
  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.logining) {
          return;
        }
        this.setState({ logining: true });

        this.auth.getCode().then(res => {
          if (!res || !res.success) {
            this.setState({ logining: false });
            return;
          }
          const data = res.result;
          const formData = JSON.parse(JSON.stringify(values));
          Promise.all([
            this.auth.rsa(formData.newPassword, data),
            this.auth.rsa(formData.oldPassword, data)
          ]).then(values => {
            const newPassword = values[0];
            const oldPassword = values[1];

            this.user.changePwd({ oldPassword, newPassword }).then(res => {
              this.setState({ logining: false });
              if (res.success) {
                utils.setCookie("ticket", "", -1);
                Modal.success({
                  title: "密码修改保存成功,请重新登录.",
                  okText: "确定",
                  onOk: () => {
                    this.props.history.replace("/login");
                  }
                });
              }
            });
          });
        });
      }
    });
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({
      confirmDirty: this.state.confirmDirty || !!value
    });
  };
  checkPassword = (rule, value, callback) => {
    if (value && value !== this.props.form.getFieldValue("newPassword")) {
      callback("两次输入密码不一致");
    } else {
      callback();
    }
  };
  checkConfirm = (rule, value, callback) => {
    if (value && this.state.confirmDirty) {
      this.props.form.validateFields(["confirmPassword"], { force: true });
    }
    callback();
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { history, location, match } = this.props;
    const route = matchRoutes(routes, location.pathname);
    return (
      <Page {...this.props} route={route[0].route}>
        <div
          className={style.body}
          style={{
            height: this.height
          }}
        >
          <div className={style.content}>
            <Form onSubmit={this.handleSubmit} className={style.form}>
              <h1 className={style.title}>首次登录，请重置初始化密码</h1>
              <div className={style.caption} />
              <div className={style.formitem}>
                <FormItem>
                  {getFieldDecorator("oldPassword", {
                    validateTrigger: ["onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入当前密码"
                      }
                    ]
                  })(
                    <Input
                      placeholder="当前密码"
                      type="password"
                      autoComplete="new-password"
                    />
                  )}
                </FormItem>

                <FormItem>
                  {getFieldDecorator("newPassword", {
                    validateTrigger: ["onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入新密码"
                      },
                      {
                        message: "6-20位，不能是纯字母或纯数字",
                        pattern: new RegExp(
                          "^(?![d]+$)(?![a-zA-Z]+$)(?![^da-zA-Z]+$).{6,20}$"
                        )
                      },
                      {
                        validator: this.checkConfirm
                      }
                    ]
                  })(
                    <Input
                      placeholder="新密码"
                      type="password"
                      autoComplete="new-password"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator("confirmPassword", {
                    validateTrigger: ["onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入确认密码"
                      },
                      {
                        validator: this.checkPassword
                      }
                    ]
                  })(
                    <Input
                      type="password"
                      placeholder="确认密码"
                      autoComplete="new-password"
                      onBlur={this.handleConfirmBlur}
                    />
                  )}
                </FormItem>
                <FormItem>
                  <Button
                    loading={this.state.logining}
                    type="primary"
                    htmlType="submit"
                    className={style.btnSubmit}>
                    保存
                  </Button>
                </FormItem>
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

const WrappedNormalLoginForm = Form.create()(LoginForm);

function Mod(props) {
  return <WrappedNormalLoginForm {...props} />;
}

export default Mod;
