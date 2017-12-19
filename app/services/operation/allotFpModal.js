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

import Clue from "model/Clue";
import User from "model/User";

import style from "./modal.scss";

const FormItem = Form.Item;
const AutoCompleteOption = AutoComplete.Option;

class AllotFpForm extends Base {
  constructor() {
    super();

    this.state = {
      autoCompleteResult: []
    };

    this.formUtils = new FormUtils("allotFpForm");
  }
  componentWillMount() {
    this.clue = new Clue();
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
            {this.props.formUtils.getFieldDecorator("customerId", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("fpId", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="分配给" {...formItemLayout}>
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

const WrappedAllotFpForm = Form.create()(AllotFpForm);

export default class AllotFpModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      customerNames: null
    };

    this.formUtils = new FormUtils("allotFpModal");
  }
  componentWillMount() {
    this.clue = new Clue();
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

    this.formUtils.validateFields((errors, values) => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        this.clue.allotFp(formData).then(res => {
          if (res.success) {
            message.success("分配负责人成功");
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
        title="分配负责人"
        width={415}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <WrappedAllotFpForm
          ref={form => (this.customerDeployForm = form)}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
