import React from "react";
import { Link, Route, Redirect } from "react-router-dom";
import { Button, Icon, Modal, Spin, message } from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import ChangePasswordForm from "./changePasswordForm";

import User from "model/User";

import style from "./changePasswordModal.scss";

export default class ChangePasswordModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false
    };

    this.formUtils = new FormUtils("changePasswordModal");
  }
  componentWillMount() {
    this.user = new User();
  }
  componentDidMount() {}
  show() {
    this.setState({ visible: true });
  }
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        const _this = this;

        this.formData = this.formUtils.getFieldsValue();

        this.user.get_tenants().then(res => {
          //帐号对应多个租户时，需求弹框提示
          if (res.success && res.result.length > 1) {
            this.handleClose();

            Modal.confirm({
              iconType: "exclamation-circle",
              title: "您的账号属于以下多个公司：",
              content: (
                <div>
                  <div className="company">
                    {res.result &&
                      res.result.map((item, index) => {
                        return <p key={`com-${index}`}>{item.name}</p>;
                      })}
                  </div>
                  <div>修改密码将同时影响以上公司的登录，请确认。</div>
                </div>
              ),
              onOk() {
                _this.handleSave();
              }
            });
          } else {
            this.handleSave();
          }
        });
      }
    });
  };
  handleSave = () => {
    const _this = this;
    this.user.getCode().then(res => {
      if (!res.success) return;

      const { exponent, modulus, random } = res.result;

      return require.ensure(["../../lib/rsa"], function() {
        const RSAUtils = require("../../lib/rsa");
        const key = RSAUtils.getKeyPair(exponent, "", modulus);

        let { oldPassword: oldPwd, newPassword: newPwd } = _this.formData;
        if (random) {
          oldPwd = oldPwd + "," + random;
          newPwd = newPwd + "," + random;
        }

        let oldPassword = RSAUtils.encryptedString(key, oldPwd);
        let newPassword = RSAUtils.encryptedString(key, newPwd);

        _this.user.changePwd({ oldPassword, newPassword }).then(res => {
          if (res.success) {
            _this.setState({
              visible: false
            });

            Modal.success({
              title: "密码修改保存成功,请重新登录.",
              okText: "确定",
              onOk: () => {
                return _this.props.callback();
              }
            });

            _this.formUtils.resetFields();
          } else {
            _this.show();
          }
        });
      });
    });
  };

  render() {
    let { visible } = this.state;
    return (
      <div>
        <Modal
          visible={visible}
          title="修改密码"
          width={500}
          className={`vant-modal yundao-modal`}
          wrapClassName="vertical-center-modal"
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          closable={false}
        >
          <ChangePasswordForm
            ref={form => (this.changePasswordForm = form)}
            formUtils={this.formUtils}
            setForm={form => (this.form = form)}
          />
        </Modal>
      </div>
    );
  }
}
