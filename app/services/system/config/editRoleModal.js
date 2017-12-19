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
  message
} from "antd";
import FormUtils from "../../../lib/formUtils";
import Role from "../../../model/Role/";
import EditRoleForm from "./editRoleForm";

import Base from '../../../components/main/Base'

import style from './editRoleModal.scss'

export default class EditRoleModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      currentTab: "0",
      formData: {}
    };
    this.formUtils = new FormUtils("editRoleModal");
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show(data) {
    this.setState({
      visible: true,
      formData: data
    },()=>{
       if(this.form){
        this.formUtils.resetFields();
        this.formUtils.setFieldsValue(data);
      }
    });

  }

  handleSubmit(e) {
    e && e.preventDefault();

    const role = new Role();

    this.formUtils.validateFields(errors => {
      if (errors) return;

      const values = this.formUtils.getFieldsValue(),
        { formData } = this.state;

      console.log("modal values:", values);

      let request = role.add;



      if (formData.id) {
        values.id = formData.id;
        request = role.edit;
      }
      request(values).then(res => {
        if (res.success) {
          this.setState({
            visible: false
          });

          message.success(`${formData.id?'编辑':'新增'}角色成功`);

          this.props.callback();
        }
      });
    });
  }
  render() {
    this.formUtils = this.props.formUtils || this.formUtils;

    return (
      <Modal
        visible={this.state.visible}
        title={(this.state.formData.id ? "编辑" : "新增") + "角色"}
        maskClosable={false}
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleCancel}
        footer={[
          <Button onClick={this.handleCancel}> 关闭 </Button>,
          <Button type="primary" onClick={() => this.handleSubmit()}> 保存 </Button>
        ]}
      >
        <EditRoleForm
          formUtils={this.formUtils}
          data={this.state.formData}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
