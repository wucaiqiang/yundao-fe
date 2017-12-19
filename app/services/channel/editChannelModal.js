import React from "react";
import { Button, Modal, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Channel from "model/Channel/";

import EditChannelForm from "./editChannelForm";

import style from "./editChannelModal.scss";

export default class EditChannelModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("editChannelModal");
  }
  componentWillMount() {
    this.channel = new Channel();
  }
  componentDidMount() {}
  show(formData = {}) {
    this.setState({ formData, visible: true }, () => {
      this.formUtils.resetFields();
      this.formUtils.setFieldsValue(formData);
    });
  }
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.channel.add(formData).then(res => {
          if (res.success) {
            this.setState({
              visible: false
            });

            message.success("添加新渠道成功.");

            this.props.reload && this.props.reload();
          }
        });
      }
    });
  };

  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        values[key] = v;
      }
    }
    return values;
  }
  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"新增渠道"}
        width={600}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        okText="保存"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
      >
        <EditChannelForm
          formUtils={this.formUtils}
          visible={visible}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
