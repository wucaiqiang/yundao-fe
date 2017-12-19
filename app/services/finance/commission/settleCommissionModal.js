import React from "react";
import { Button, Modal, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Commission from "model/Finance/commission";

import SettleCommissionForm from "./settleCommissionForm";

import style from "./settleCommissionModal.scss";

export default class SettleCommissionModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      submitting: false,
      formData: {}
    };

    this.formUtils = new FormUtils("SettleCommissionModal");
  }
  componentWillMount() {
    this.commission = new Commission();
  }
  componentDidMount() {}
  show(data = {}) {
    this.calcCommissionAndAmount(data);

    this.setState({ formData: data, visible: true }, () => {
      this.formUtils.resetFields();
    });
  }

  /**
   * 获取佣金信息并自动填写费率佣金到表单
   */
  calcCommissionAndAmount = data => {
    this.commission.get(data.id).then(res => {
      if (res.success && res.result) {
        const rules = res.result.productCommissionRules;

        let frontCommission = null;
        let isMatch = false;

        rules &&
          rules.map(rule => {
            if (isMatch) return;
            rule.productCommissionDtos &&
              rule.productCommissionDtos.map(commission => {
                //saleMax 可能null
                if (
                  commission.saleMax &&
                  data.dealAmount >= commission.saleMin &&
                  data.dealAmount < commission.saleMax
                ) {
                  frontCommission = commission.frontCommission;
                  isMatch = true;

                  return;
                } else if (data.dealAmount >= commission.saleMin) {
                  frontCommission = commission.frontCommission;
                  isMatch = true;
                  return;
                }
              });
          });

        if (frontCommission) {
          let formData = {
            rate: frontCommission,
            amount: frontCommission * data.dealAmount * 100
          };

          this.formUtils.setFieldsValue(formData);
        }
      }
    });
  };

  handleClose = () => {
    this.formUtils.resetFields();
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();
    if (this.state.submitting) {
      return;
    }

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.setState({ submitting: true });

        this.commission.add(formData).then(res => {
          this.setState({ submitting: false });
          if (res.success) {
            this.setState({ visible: false });
            message.success("录入佣金成功.");
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
      <Button
        type="primary"
        loading={this.state.submitting}
        key="submit"
        onClick={this.handleSubmit}
      >
        保存
      </Button>
    ];
    return btns;
  }
  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"录入佣金"}
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        footer={this.renderFooter()}
      >
        <SettleCommissionForm
          ref={form => (this.customerForm = form)}
          formUtils={this.formUtils}
          data={this.state.formData}
          noticeType={this.props.noticeType}
          setForm={form => (this.form = form)}
          callback={this.props.callback}
        />
      </Modal>
    );
  }
}
