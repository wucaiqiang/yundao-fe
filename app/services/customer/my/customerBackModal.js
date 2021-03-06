import React from "react";
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Icon,
  Modal,
  Spin,
  message
} from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer";

import style from "./customerFollowModal.scss";

const FormItem = Form.Item;

class CustomerBackForm extends Base {
  constructor() {
    super();
    this.formUtils = new FormUtils("customerBackForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    return cls.join(" ");
  }
  render() {
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    return (
      <div>
        <Form className={this.getFormClassName()}>
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("customerIds", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="放弃原因" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("reason", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过50个字符",
                  min: 1,
                  max: 50
                }
              ]
            })(<Input type="textarea" rows={3} size="large" />)}
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedCustomerBackForm = Form.create()(CustomerBackForm);

export default class CustomerBackModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      customerNames: []
    };

    this.formUtils = new FormUtils("customerBackModal");
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {}
  show(data) {
    this.setState(
      {
        visible: true,
        customerNames: data.customerNames
      },
      () => {
        this.formUtils.setFieldsValue(data);
      }
    );
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  handleOk = e => {
    e && e.preventDefault();
    const _this = this;

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);
        formData.execute = true;

        this.customer.back(formData).then(res => {
          const { failList = [], passList = [] } = res.result || {};

          if (failList && failList.length) {
            let successIds = [],
              messageContent = [],
              messages = {};

            passList.map(item => {
              successIds.push(item.id);
            });

            //汇总错误信息
            failList.map(item => {
              if (!messages[item.code]) {
                messages[item.code] = {
                  message: item.message,
                  name: [item.name]
                };
              } else {
                messages[item.code].name.push(item.name);
              }
            });

            for (var key in messages) {
              if (messages.hasOwnProperty(key)) {
                let item = messages[key];
                messageContent.push(
                  <div key={`message_${key}`}>
                    <p>{`${item.message}:`}</p>
                    <p>{item.name.join("、")}</p>
                  </div>
                );
              }
            }

            if (successIds.length > 0) {
              Modal.confirm({
                width: 460,
                title: `您选择的客户中，以下${failList.length}个客户无法放弃：`,
                content: (
                  <div>
                    <div style={{ paddingTop: 15, paddingBottom: 15 }}>
                      {messageContent}
                    </div>
                    <p
                      style={{
                        fontSize: "14px"
                      }}
                    >
                      是否继续放弃其他选中客户？
                    </p>
                  </div>
                ),
                onOk() {
                  formData.customerIds = successIds.join(",");

                  return _this.customer.back(formData).then(res => {
                    if (res.success) {
                      message.success("放弃成功");
                      _this.setState(
                        {
                          visible: false
                        },
                        () => {
                          _this.formUtils.resetFields();
                        }
                      );

                      _this.props.reload && _this.props.reload();
                    }
                  });
                }
              });
            } else {
              //错误同一个原因时
              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的客户无法放弃：",
                content: <div style={{ paddingTop: 15 }}>{messageContent}</div>,
                okText: "确定"
              });
            }
          } else if (res.success) {
            message.success("放弃成功");
            _this.setState(
              {
                visible: false
              },
              () => {
                _this.formUtils.resetFields();
              }
            );

            _this.props.reload && _this.props.reload();
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
    let { visible, formData } = this.state;
    return (
      <Modal
        visible={visible}
        title="放弃客户"
        width={415}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div className="ant-confirm-body-wrapper">
          <div className="ant-confirm-body">
            <i className="anticon anticon-exclamation-circle" />
            <span className="ant-confirm-title">您选择放弃以下客户，请输入放弃原因：</span>
            <div className="ant-confirm-content">
              <div>
                <p className="customer-name">{this.state.customerNames}</p>
                <WrappedCustomerBackForm
                  ref={form => (this.customerBackForm = form)}
                  formUtils={this.formUtils}
                  setForm={form => (this.form = form)}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
