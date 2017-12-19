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

class CustomerAllotForm extends Base {
  constructor() {
    super();

    this.state = {
      autoCompleteResult: []
    };

    this.formUtils = new FormUtils("customerAllotForm");
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
    this.formUtils.resetFields(["csId"]);

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
    this.formUtils.setFieldsValue({ csId: value });
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
            {this.props.formUtils.getFieldDecorator("csId", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="回访负责人" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("realName", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入并选择回访负责人"
                }
              ]
            })(
              <AutoComplete
                placeholder="请输入并选择回访负责人"
                dataSource={this.getOptions(autoCompleteResult)}
                onSearch={this.handleSearch}
                onSelect={(value, option) =>
                  this.handleSearchSelect(value, option)}
              >
                <Input />
              </AutoComplete>
            )}
          </FormItem>
          <FormItem label="回访事由" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("matter", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过100个字符",
                  min: 1,
                  max: 100
                }
              ]
            })(
              <Input
                type="textarea"
                rows={3}
                size="large"
              />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedCustomerAllotForm = Form.create()(CustomerAllotForm);

export default class CustomerAllotModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      customerNames: null
    };

    this.formUtils = new FormUtils("customerAllotModal");
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

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.customer.allot_to_cs(formData).then(res => {
          if (res.success) {
            message.success("分配回访成功");
            this.setState(
              {
                visible: false
              },
              () => {
                this.formUtils.resetFields();
              }
            );

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
        title="分配回访"
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div className="ant-confirm-body-wrapper">
          <div className="ant-confirm-body">
            <i className="anticon anticon-exclamation-circle" />
            <span className="ant-confirm-title">您选择以下客户进行分配回访：</span>
            <div className="ant-confirm-content">
              <div>
                <p className="customer-name">
                  {this.state.customerNames}
                </p>
              </div>
            </div>
            <WrappedCustomerAllotForm
              ref={form => (this.customerAllotForm = form)}
              formUtils={this.formUtils}
              setForm={form => (this.form = form)}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
