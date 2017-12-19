import React, { Component } from "react";
import {
  Select,
  Cascader,
  Input,
  DatePicker,
  Tag,
  Checkbox,
  Button,
  Table,
  Modal,
  Form,
  Pagination,
  Spin,
  Menu,
  Icon,
  message
} from "antd";
import FormUtils from "../../../lib/formUtils";
import User from "../../../model/User/";
import EditUserForm from "./editUserForm";

const SubMenu = Menu.SubMenu;

import style from "./editUserModal.scss";

import Base from "../../../components/main/Base";

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
    this.user = new User();
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show(data) {
    if (data.id) {
      this.setState({ loading: true });
      this.user.get(data.id).then(res => {
        this.setState({ loading: false });
        if (res.success) {
          let data = res.result;
          if (data.departmentId ) {
            data.departmentId = data.departmentId.toString();
          }

          this.setState(
            {
              visible: true,
              isEdit: false,
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
      });
    } else {
      if (data.departmentId) {
        data.departmentId = data.departmentId.toString();
      }

      this.setState(
        {
          visible: true,
          isEdit: true,
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
  }

  handleSetForm(form) {
    this.form = form;
  }

  handleSubmit = e => {
    e && e.preventDefault();
    const user = new User();
    this.formUtils.validateFields(errors => {
      if (!errors) {
        const values = this.formUtils.getFieldsValue();
        console.log("modal values:", values);
        let request = null;
        if (this.state.formData.id) {
          values.id = this.state.formData.id;
          request = user.edit;
          // if (this.state.formData.isSystem === 1) {
          //   //系统管理员的 部门为整个公司
          //   values.departmentId = 0;
          // }
          //编辑
        } else {
          //新增
          request = user.add;
        }
        const roleIds = [];
        values.roleIds.map(role => {
          if (roleIds.indexOf(role) == -1) {
            roleIds.push(role);
          }
        });
        values.roleIds = roleIds.join(",");
        request(values).then(res => {
          if (res.success) {
            message.success(`${this.state.formData.id ? "编辑" : "新增"}员工成功`);
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
              : "新增") + "员工"}
            {this.state.isEdit ||
            this.state.loading ||
            this.state.formData.isDimission ? null : (
              <Icon
                className={"fr"}
                type="edit"
                onClick={() => {
                  this.setState({
                    isEdit: true
                  });
                }}
              />
            )}
          </div>
        }
        maskClosable={false}
        closable={false}
        width={552}
        className={`vant-modal ${style.edit_user_modal} yundao-modal`}
        wrapClassName="vertical-center-modal"
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
            <Button key="save" type="primary" onClick={this.handleSubmit}>
              保存
            </Button>
          )
        ]}
      >
        <Spin spinning={this.state.loading}>
          <div className={style.body}>
            <div className={style.tabContent}>
              {!this.state.visible ? null : (
                <EditUserForm
                  isInModal={true}
                  formUtils={this.formUtils}
                  data={this.state.formData}
                  formType={this.state.currentTab}
                  setForm={form => this.handleSetForm(form)}
                  isEdit={this.state.isEdit}
                  ref="sellChanceForm"
                />
              )}
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}

export default EditUserModal;
