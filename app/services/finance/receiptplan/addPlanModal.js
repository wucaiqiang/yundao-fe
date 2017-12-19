import React from "react";
import { Link } from "react-router-dom";

import { Button, Modal, message } from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Receipt from "model/Finance/receipt";

import AddPlanForm from "./addPlanForm";

import style from "./addPlanModal.scss";

export default class AddPlanModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      confirmLoading: false
    };

    this.formUtils = new FormUtils("addPlanModal");
  }
  componentWillMount() {
    this.receipt = new Receipt();
  }
  componentDidMount() {}
  show() {
    this.setState({ visible: true });
  }
  handleRedirect(id) {
    this.modal.destroy();
    this.props.history.replace(`/finance/receiptplan/detail/${id}?tab=2`);
  }
  handleClose = () => {
    this.setState({ visible: false }, () => {
      this.formUtils.resetFields();
      //清除供应商显示
      this.form.clearSupplier();
    });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        if (!formData.productId) {
          message.error("回款产品有误，请重新选择");
        }

        formData = this.formatData(formData);

        this.setState({ confirmLoading: true });

        this.receipt.add(formData).then(res => {
          this.setState({ confirmLoading: false });

          if (res.success) {
            let { id, declarationCount } = res.result;
            this.setState({
              visible: false
            });

            this.formUtils.resetFields();
            //清除供应商显示
            this.form.clearSupplier();

            this.modal = Modal.success({
              title: "新增回款计划成功",
              content:
                declarationCount > 0 ? (
                  <div>
                    已自动关联该回款产品审批通过的报单
                    <a onClick={e => this.handleRedirect(id)}>点击查看</a>
                  </div>
                ) : (
                  "暂无可关联的报单，成单后您可在回款计划详情中关联"
                ),
              okText: "确定"
            });

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
        values[key] = v;
      }
    }
    return values;
  }
  render() {
    let { visible, confirmLoading } = this.state;
    return (
      <Modal
        visible={visible}
        title={"新增回款计划"}
        width={550}
        maskClosable={false}
        confirmLoading={confirmLoading}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        okText="保存"
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
      >
        <AddPlanForm
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
