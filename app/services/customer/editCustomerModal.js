import React from "react";
import { Button, Modal, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";

import EditCustomerForm from "./editCustomerForm";

import style from "./editCustomerModal.scss";

export default class EditCustomerModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("editCustomerModal");
  }
  componentWillMount() {
    this.customer = new Customer();
    this.request = this.customer.add;
  }
  componentDidMount() {}
  show(data = {}) {
    //客户公海新增客户接口不同，特殊处理
    if (data.origin === "hignseas") {
      this.request = this.customer.addOpensea;
    } else if (data.origin === "pool") {
      this.request = this.customer.addPool;
    }

    let formData = {
      isTimingSend: "0",
      sendTime: null,
      productId: null,
      content: "",
      addCustomerType: data.addCustomerType
    };

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

        if (formData.expireDate) {
          formData.expireDateBegin = formData.expireDate[0];
          formData.expireDateEnd = formData.expireDate[1];

          delete formData.expireDate;
        }

        // 新增客户入口  1、我的客户 2、全部客户
        formData.addCustomerType = this.state.formData.addCustomerType || 1;

        this.request(formData).then(res => {
          if (res.success) {
            this.setState({
              visible: false
            });
            message.success("添加新客户成功.");
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
          v = v.format("YYYY-MM-DD");
        }
        if (v instanceof Array) {
          if (v.length > 0 && v[0] instanceof moment) {
            v = v.map(item => item.format("YYYY-MM-DD"));
          } else {
            v = v.join(",");
          }
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        values[key] = v;
      }
    }
    return values;
  }
  renderFooterBtn() {
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
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={"新增客户"}
        width={680}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}
      >
        <EditCustomerForm
          ref={form => (this.customerForm = form)}
          formUtils={this.formUtils}
          visible={visible}
          noticeType={this.props.noticeType}
          setForm={form => (this.form = form)}
          callback={this.props.callback}
        />
      </Modal>
    );
  }
}
