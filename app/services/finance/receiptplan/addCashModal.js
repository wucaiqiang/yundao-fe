import React from "react";
import { Button, Modal, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Receipt from "model/Finance/receipt";

import AddPlanForm from "./addCashForm";

import style from "./addCashModal.scss";

export default class AddCashModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      confirmLoading: false,
      data: {}
    };

    this.formUtils = new FormUtils("addCashModal");
  }
  componentWillMount() {}
  componentDidMount() {
    this.receipt = new Receipt();
  }
  show(data) {
    this.setState({ visible: true, data });
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

        formData = this.formatData(formData);
        formData.isInvoiced = formData.isInvoiced ? 1 : 0;

        this.receipt.addRecord(formData).then(res => {
          if (res.success) {
            message.success("新增回款记录成功.");
            this.setState({
              visible: false
            });

            this.formUtils.resetFields();

            this.props.reload();
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
  renderFooter() {
    const btns = [
      <Button key="cancel" onClick={this.handleClose}>
        取消
      </Button>,
      <Button type="primary" key="submit" onClick={this.handleSubmit}>
        保存
      </Button>
    ];
    return btns;
  }
  render() {
    let { visible, confirmLoading, data } = this.state;
    return (
      <Modal
        visible={visible}
        title={"录入回款记录"}
        width={580}
        maskClosable={false}
        confirmLoading={confirmLoading}
        getContainer={() => this.props.container}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
        footer={this.renderFooter()}
      >
        <AddPlanForm
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
          data={data}
        />
      </Modal>
    );
  }
}
