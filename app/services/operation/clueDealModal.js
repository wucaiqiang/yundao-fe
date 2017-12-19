import React from "react";
import ReactDom from "react-dom";
import {
  Form,
  Input,
  Button,
  Radio,
  Modal,
  Checkbox,
  Select,
  Spin,
  message
} from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Clue from "model/Clue";
import Dictionary from "model/dictionary";

import style from "./modal.scss";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class CustomCheckbox extends React.Component {
  render() {
    return (
      <Checkbox checked={this.props.value} onChange={this.props.onChange}>
        {this.props.children}
      </Checkbox>
    );
  }
}

class ClueDealForm extends Base {
  constructor() {
    super();

    this.formUtils = new FormUtils("clueDealForm");

    this.radioOptions = [
      { label: "已跟进", value: "1" },
      { label: "作废", value: "2" }
    ];

    this.state = { dic_follow_up_type: [] };
  }
  componentWillMount() {
    this.clue = new Clue();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);

    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    this.getDictionary();
  }
  getDictionary() {
    const dictionary = new Dictionary();
    dictionary.gets("dic_follow_up_type").then(res => {
      if (res.success && res.result) {
        let dictionary = {};
        res.result.map(item => {
          this.setState({ [item.value]: item.selections });
        });
      }
    });
  }

  getOptions = data => {
    return data.map(item => {
      return (
        <Option key={item.value} value={item.value.toString()}>
          {item.label}
        </Option>
      );
    });
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };

    const { dic_follow_up_type } = this.state;
    const isShow = this.formUtils.getFieldValue("status") === "1";

    let isSyncToFollow = true;

    if (this.formUtils.getFieldValue("isSyncToFollow") !== undefined) {
      isSyncToFollow = this.formUtils.getFieldValue("isSyncToFollow");
    }
    //作废不需要跟进记录

    return (
      <Form ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="处理情况" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("status", {
            initialValue: "1",
            rules: [
              {
                required: true,
                type: "string",
                message: "请选择一项"
              }
            ]
          })(<RadioGroup options={this.radioOptions} />)}
        </FormItem>
        {isShow && isSyncToFollow ? (
          <FormItem label="备注" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("followRemark", {
              initialValue: "",
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入备注"
                }
              ]
            })(<Input type="textarea" rows={3} />)}
          </FormItem>
        ) : (
          <FormItem label="备注" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("followRemark", {
              initialValue: "",
              rules: [
                {
                  type: "string",
                  whitespace: true
                }
              ]
            })(<Input type="textarea" rows={3} />)}
          </FormItem>
        )}
        <FormItem
          label="   "
          {...formItemLayout}
          style={{ display: isShow ? "block" : "none" }}
        >
          {this.props.formUtils.getFieldDecorator("isSyncToFollow", {
            initialValue: true
          })(<CustomCheckbox>同步到跟进记录</CustomCheckbox>)}
        </FormItem>
        {isShow && isSyncToFollow ? (
          <FormItem label="跟进方式" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("type", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请选择跟进方式"
                }
              ]
            })(
              <Select size="large" getPopupContainer={() => this.container}>
                {this.getOptions(dic_follow_up_type)}
              </Select>
            )}
          </FormItem>
        ) : null}
      </Form>
    );
  }
}

const WrappedClueDealForm = Form.create()(ClueDealForm);

export default class ClueDealModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false
    };

    this.formUtils = new FormUtils("clueDealModal");
  }
  componentWillMount() {
    this.clue = new Clue();
  }
  componentDidMount() {}
  show(data) {
    this.setState(
      {
        visible: true
      },
      () => {
        this.formUtils.setFieldsValue(data);
      }
    );
  }
  handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.formUtils.resetFields();
    });
  };
  handleOk = e => {
    e && e.preventDefault();

    this.formUtils.validateFields((errors, values) => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();
        formData.isSyncToFollow = formData.isSyncToFollow ? 1 : 0;

        this.clue.process(formData).then(res => {
          if (res.success) {
            message.success("跟进成功");

            this.setState({ visible: false }, () => {
              setTimeout(() => {
                this.formUtils.resetFields();
              }, 1000);
            });

            let { reload } = this.props;

            reload && reload();
          }
        });
      }
    });
  };

  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title="处理线索"
        width={450}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        getContainer={() => this.props.container}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <WrappedClueDealForm
          ref={form => (this.customerDeployForm = form)}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
