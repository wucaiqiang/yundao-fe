import React from "react";
import ReactDOM from "react-dom";
import { Button, Form, Select, Input, Modal, message } from "antd";

import Base from "components/main/Base";
import SearchSelect from "components/Form/SearchSelect";

import FormUtils from "lib/formUtils";

import User from "model/User/";
import Decision from "model/Project/decision";
import Dictionary from "model/dictionary";

import style from "./addAdviceModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

class AddAdviceForm extends Base {
  constructor() {
    super();
    this.state = {
      dic_project_decision_suggestion: []
    };
    this.formUtils = new FormUtils("AddAdviceForm");
  }
  componentWillMount() {
    this.user = new User();
    this.dictionary = new Dictionary();

    this.getDictionary();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  getDictionary() {
    this.dictionary.gets("dic_project_decision_suggestion").then(res => {
      if (res.success && res.result) {
        let state = this.state;

        res.result.map(item => {
          state[item.value] = item.selections;
        });

        this.setState(state);
      }
    });
  }
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    const { data } = this.props;
    const { dic_project_decision_suggestion } = this.state;

    return (
      <Form
        className={`float-slide-form vant-spin follow-form`}
        ref={ref => (this.container = ReactDOM.findDOMNode(ref))}
      >
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("decisionId", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <div id="proposerId_FormItem">
          <FormItem label="意见人" {...formItemLayout}>
            <SearchSelect
              name="proposerId"
              placeholder="请输入并选择意见人"
              request={this.user.get_users_by_realName}
              format={r => {
                return {
                  value: r.id,
                  label: `${r.realName}(${r.mobile})`
                };
              }}
              formUtils={this.props.formUtils}
              initData={{
                label: data.proposer,
                value: data.proposerId
              }}
            />
            {this.props.formUtils.getFieldDecorator("proposerId", {
              initialValue: null,
              rules: [
                {
                  required: true,
                  message: "请输入并选择意见人"
                }
              ]
            })(<Input type="hidden" />)}
          </FormItem>
        </div>
        <FormItem label="意见" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("suggest", {
            initialValue: "",
            rules: [
              {
                required: true,
                message: "请选择意见"
              }
            ]
          })(
            <Select
              getPopupContainer={() => this.container}
              size="large"
              allowClear={true}
              placeholder="请选择"
            >
              {dic_project_decision_suggestion &&
                dic_project_decision_suggestion.map(item => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem label="详情" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("remark", {
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
          })(<Input type="textarea" rows={3} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

const WrappedAddAdviceForm = Form.create()(AddAdviceForm);

export default class AddAdviceModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      confirmLoading: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("addAdviceModal");
  }
  componentWillMount() {
    this.decision = new Decision();
  }
  componentDidMount() {}
  show = (data = {}) => {
    this.setState({ visible: true, formData: data }, () => {
      this.formUtils.resetFields();
      this.formUtils.setFieldsValue(data);
    });
  };
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        let request = formData.id
          ? this.decision.edit_suggestion
          : this.decision.add_suggestion;

        this.setState({ confirmLoading: true });

        request(formData).then(res => {
          this.setState({ confirmLoading: false });

          if (res.success) {
            message.success(formData.id ? "修改意见成功" : "新增意见成功");

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

  render() {
    const { visible, formData, confirmLoading } = this.state;

    return (
      <Modal
        visible={visible}
        confirmLoading={confirmLoading}
        title="新增意见"
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
      >
        {visible ? (
          <WrappedAddAdviceForm
            data={formData}
            formUtils={this.formUtils}
            setForm={form => (this.form = form)}
          />
        ) : null}
      </Modal>
    );
  }
}
