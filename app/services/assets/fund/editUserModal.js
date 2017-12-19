import React, { Component } from "react";
import { Input, Button, Modal, Form, Spin, Icon, message } from "antd";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import Team from "model/Assets/team";

import style from "./EditUserModal.scss";

const TextArea = Input.TextArea;
const FormItem = Form.Item;

class EditUserForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      roles: [],
      data: this.props.data
    };
    this.formUtils = new FormUtils("editUserForm");
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  componentDidMount() {}

  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }

    return cls.join(" ");
  }

  render() {
    let formUtils;
    formUtils = this.formUtils;

    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 20
      }
    };

    this.formItemLayout = formItemLayout;

    const { data, isEdit } = this.props;

    return (
      <div
        id="edit_user_form"
        style={{
          position: "relative"
        }}
      >
        <Form className={this.getFormClassName()}>
          {this.props.formUtils.getFieldDecorator("fundId", {
            initialValue: data.fundId
          })(<Input type="hidden" />)}
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: data.id
          })(<Input type="hidden" />)}
          <FormItem label="姓名" {...formItemLayout}>
            {!isEdit
              ? data.name
              : this.props.formUtils.getFieldDecorator("name", {
                  initialValue: data.name,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      type: "string",
                      whitespace: true,
                      message: "输入长度不超过10个字符",
                      min: 1,
                      max: 10
                    }
                  ]
                })(<Input type="text" placeholder="请输入姓名" />)}
          </FormItem>
          <FormItem label="职位" {...formItemLayout}>
            {!isEdit
              ? data.position
              : this.props.formUtils.getFieldDecorator("position", {
                  initialValue: data.position,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      type: "string",
                      whitespace: true,
                      message: "输入长度不超过10个字符",
                      min: 1,
                      max: 10
                    }
                  ]
                })(<Input type="text" placeholder="请输入职位" />)}
          </FormItem>

          <FormItem label="简介" {...formItemLayout}>
            {!isEdit
              ? data.remark
              : this.props.formUtils.getFieldDecorator("remark", {
                  initialValue: data.remark,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      type: "string",
                      whitespace: true,
                      message: "输入长度不超过200个字符",
                      min: 1,
                      max: 200
                    }
                  ]
                })(
                  <TextArea
                    autosize={{ minRows: 2, maxRows: 6 }}
                    type="text"
                    placeholder="请输入简介"
                  />
                )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

EditUserForm = Form.create()(EditUserForm);

class EditUserModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      currentTab: "0",
      formData: {}
    };
    this.formUtils = new FormUtils("editUserModal");
  }
  componentWillMount() {
    this.team = new Team();
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show(data = {}) {
    this.setState(
      {
        visible: true,
        isEdit: data.id ? false : true,
        formData: data
      },
      () => {
        if (this.form) {
          this.formUtils.resetFields();
          this.formUtils.setFieldsValue(data);
        }
      }
    );
  }

  handleSetForm(form) {
    this.form = form;
  }

  handleSubmit = e => {
    e && e.preventDefault();
    this.formUtils.validateFields(errors => {
      if (!errors) {
        const values = this.formUtils.getFieldsValue();
        console.log("modal values:", values);
        let request = null;
        if (this.state.formData.id) {
          request = this.team.update;
          //编辑
        } else {
          //新增
          request = this.team.add;
        }
        this.setState({
          submiting: true
        });
        request(values).then(res => {
          this.setState({
            submiting: false
          });
          if (res.success) {
            message.success(
              `${this.state.formData.id ? "编辑" : "新增"}成员成功`
            );
            this.setState({ visible: false });
            this.props.submit(values);
          }
        });
      }
    });
  };
  render() {
    let formUtils;

    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };
    formUtils = this.props.formUtils || this.formUtils;
    this.formUtils = formUtils;

    return (
      <Modal
        visible={this.state.visible}
        title={
          <div>
            {(this.state.formData.id
              ? this.state.isEdit ? "编辑" : "查看"
              : "新增") + "成员"}
            {this.state.isEdit ||
            this.state.loading ||
            this.state.formData.editPermission ? (
              <Icon
                className={"fr"}
                type="edit"
                onClick={() => {
                  this.setState({
                    isEdit: true
                  });
                }}
              />
            ) : null}
          </div>
        }
        maskClosable={false}
        closable={false}
        width={552}
        className={`vant-modal ${style.modal} yundao-modal`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleCancel}
        footer={[
          this.state.isEdit && this.state.formData.id ? (
            <Button
              key="cancel"
              onClick={() => {
                this.setState({
                  isEdit: false
                });
              }}
            >
              取消
            </Button>
          ) : (
            <Button key="close" onClick={this.handleCancel}>
              关闭
            </Button>
          ),
          this.state.loading ? null : !this.state.isEdit ? null : (
            <Button
              key="save"
              loading={this.state.submiting}
              type="primary"
              onClick={this.handleSubmit}
            >
              保存
            </Button>
          )
        ]}
      >
        <Spin spinning={this.state.loading}>
          <EditUserForm
            isInModal={true}
            formUtils={this.formUtils}
            data={this.state.formData}
            setForm={form => this.handleSetForm(form)}
            isEdit={this.state.isEdit}
            ref="sellChanceForm"
          />
        </Spin>
      </Modal>
    );
  }
}

export default EditUserModal;
