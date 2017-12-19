import React from "react";
import { Button, Modal, message } from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Assets from "model/Assets/index";

import EditProjectForm from "./editProjectForm";

import style from "./editProjectModal.scss";

export default class EditProjectModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      confirmLoading: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("editProjectModal");
  }
  componentWillMount() {
    this.assets = new Assets();
  }
  componentDidMount() {}
  show(data = {}) {
    this.setState({ visible: true, formData: data });
  }
  handleClose = () => {
    this.setState({ visible: false }, () => {
      this.formUtils.resetFields();
    });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        this.setState({ confirmLoading: true });

        this.assets.add(formData).then(res => {
          this.setState({ confirmLoading: false });

          if (res.success) {
            message.success("新增项目成功");

            this.props.reload && this.props.reload();

            this.setState(
              {
                visible: false
              },
              () => {
                this.formUtils.resetFields();
              }
            );
          }
        });
      }
    });
  };

  handleCallBack = (industry, industryId) => {
    this.props.callback && this.props.callback(industry);

    this.formUtils.setFieldsValue({
      industryId
    });
  };

  render() {
    const { industry, source } = this.props;
    const { visible, confirmLoading, formData } = this.state;
    return (
      <Modal
        visible={visible}
        confirmLoading={confirmLoading}
        title="新增项目"
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        maskClosable={false}
      >
        <EditProjectForm
          formUtils={this.formUtils}
          visible={visible}
          formData={formData}
          industry={industry}
          source={source}
          setForm={form => (this.form = form)}
          callback={this.handleCallBack}
        />
      </Modal>
    );
  }
}
