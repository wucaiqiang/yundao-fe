import React from "react";
import {
  AutoComplete,
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
import User from "model/User";

import style from "./modal.scss";

const FormItem = Form.Item;
const AutoCompleteOption = AutoComplete.Option;

class CustomerDeployForm extends Base {
  constructor() {
    super();

    this.state = {
      autoCompleteResult: []
    };

    this.formUtils = new FormUtils("customerDeployForm");
  }
  componentWillMount() {
    this.customer = new Customer();
    this.user = new User();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  handleSearch = value => {
    //搜索变化时重新赋值
    this.formUtils.resetFields(["fpId"]);

    if (!value) {
      this.setState({ autoCompleteResult: [] });
    } else {
      const _this = this;
      this.user.get_users_by_realName(value).then(res => {
        if (res.success) {
          _this.setState({ autoCompleteResult: res.result });
        }
      });
    }
  };
  handleSearchSelect(value, option) {
    this.formUtils.setFieldsValue({ fpId: value });
  }
  getOptions = autoCompleteResult => {
    return autoCompleteResult.map(item => {
      return (
        <AutoCompleteOption key={item.id} title={item.realName}>
          {`${item.realName}(${item.mobile})`}
        </AutoCompleteOption>
      );
    });
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    const { autoCompleteResult } = this.state;

    return (
      <div>
        <Form className={`float-slide-form vant-spin follow-form`}>
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("customerIds", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("fpId", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="调配给" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("realName", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入并选择负责人"
                }
              ]
            })(
              <AutoComplete
                placeholder="请输入并选择负责人"
                dataSource={this.getOptions(autoCompleteResult)}
                onSearch={this.handleSearch}
                onSelect={(value, option) =>
                  this.handleSearchSelect(value, option)}
              >
                <Input />
              </AutoComplete>
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedCustomerDeployForm = Form.create()(CustomerDeployForm);

export default class CustomerDeployModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      customerNames: null
    };

    this.formUtils = new FormUtils("customerDeployModal");
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {}
  show(data) {
    this.setState(
      {
        ...data,
        visible: true
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

        if (!formData.fpId) {
          message.error("输入负责人不存在，请重新搜索并选择");
          return;
        }
        formData = this.formatData(formData);

        this.customer.allot_to_fp(formData).then(res => {
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
                title: `您选择的客户中，以下${failList.length}个客户无法调配：`,
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
                      是否继续调配其他选中客户？
                    </p>
                  </div>
                ),
                onOk() {
                  formData.customerIds = successIds.join(",");

                  return _this.customer.allot_to_fp(formData).then(res => {
                    if (res.success) {
                      message.success("调配成功");
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
                title: "您选择的客户无法调配：",
                content: <div style={{ paddingTop: 15 }}>{messageContent}</div>,
                okText: "确定"
              });
            }
          } else if (res.success) {
            message.success("调配成功");
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
        title="调配客户"
        width={415}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div className="ant-confirm-body-wrapper">
          <div className="ant-confirm-body">
            <i className="anticon anticon-exclamation-circle" />
            <span className="ant-confirm-title">您选择以下客户进行调配：</span>
            <div className="ant-confirm-content">
              <div>
                <p className="customer-name">{this.state.customerNames}</p>
              </div>
            </div>
            <WrappedCustomerDeployForm
              ref={form => (this.customerDeployForm = form)}
              formUtils={this.formUtils}
              setForm={form => (this.form = form)}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
