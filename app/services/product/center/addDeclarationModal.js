import React from "react";
import ReactDOM from 'react-dom'
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Declaration from "model/Declaration/";

import AddDeclarationForm from "./addDeclarationForm";


import style from "./addDeclarationModal.scss";

export default class EditDeclarationModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      formData: {}
    };

    this.formUtils = new FormUtils("addDeclarationModal");
  }
  componentWillMount() {
    this.declaration = new Declaration();
  }
  componentDidMount() {}
  show(data = {}) {
    this.setState({ visible: true, formData: data });
    if (this.formUtils) {
      this.formUtils.resetFields();
    }
  }
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    const { id, declarationModel } = this.state.formData;

    this.formUtils.validateFields(errors => {
      if (!errors) {
        this.setState({
          submitting: true
        });
        let formData = this.formUtils.getFieldsValue();
        //提交报单时会没有 预约编号
        if (!formData.reservationId) {
          formData.reservationId = id;
        }
        if (declarationModel == 1) {
          delete formData.reservationId;
        }
        formData = this.formatData(formData);

        //来自产品中心报单 使用不同的接口
        const { from } = this.state.formData;
        let request = this.declaration.add;
        switch (from) {
          case "product.center":
            request = this.declaration.center_add;
            break;
          case "appointment.my":
            request = this.declaration.appint_add;
            break;
          default:
            break;
        }
        request(formData).then(res => {
          this.setState({
            submitting: false
          });
          if (res.success) {
            this.setState({ visible: false });

            const declarationId = res.result;

            this.declaration.validate(res.result).then(res => {
              if (res.success) {
                message.success("新增报单成功");
              } else {
                const modal = Modal.confirm({
                  className:"showfloat",
                  iconType: "check-circle",
                  title: "报单已创建，请完善资料后提交审批",
                  content: `待完善资料:${res.message}`,
                  cancelText: "关闭",
                  okText: "去完善",
                  onOk: (e) => {
                    this.props.parent.showFloat("declarationDetailFloat", {id:declarationId})
                    modal.destroy()
                  }
                });
              }
            });

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
  renderFooterBtn() {
    const btns = [
      <Button
        key="cancel"
        onClick={() => {
          this.setState({ visible: false });
        }}
      >
        取消
      </Button>,
      <Button
        key="sure"
        type="primary"
        loading={this.state.submitting}
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
        title={"新增报单"}
        width={500}
        className={`vant-modal yundao-modal  ${style.modal}`}
        wrapClassName="vertical-center-modal "
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}
      >
        {visible ? (
          <AddDeclarationForm
            initFields={this.props.initFields}
            ref={form => (this.customerForm = form)}
            data={this.state.formData}
            formUtils={this.formUtils}
            isEdit={this.state.isEdit}
            setForm={form => (this.form = form)}
            callback={this.props.callback}
          />
        ) : null}
      </Modal>
    );
  }
}
