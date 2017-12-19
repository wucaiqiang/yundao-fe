import React from "react";
import ReactDOM from "react-dom";
import { Button, Form, Select, Input, Modal, message } from "antd";

import Base from "components/main/Base";

import Confirm from "components/modal/Confirm";
import FormUtils from "lib/formUtils";

import Dictionary from "model/dictionary";
import Decision from "model/Project/decision";

import style from "./addAdviceModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

class AddRoundForm extends Base {
  constructor() {
    super();

    this.formUtils = new FormUtils("AddRoundForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
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

    const { round } = this.props;

    let oldRound = this.formUtils.getFieldValue("oldRound");

    return (
      <Form
        className={`float-slide-form vant-spin follow-form`}
        ref={ref => (this.container = ReactDOM.findDOMNode(ref))}
      >
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("projectId", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("oldRound", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="新增轮次" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("round", {
            initialValue: "",
            rules: [
              {
                required: true,
                message: "请选择新增轮次"
              }
            ]
          })(
            <Select
              getPopupContainer={() => this.container}
              size="large"
              allowClear={true}
              placeholder="请选择"
            >
              {round &&
                round.map(item => {
                  return (
                    <Option
                      key={item.value}
                      value={item.value}
                      disabled={oldRound && item.value <= oldRound}
                    >
                      {item.label}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
      </Form>
    );
  }
}

const WrappedAddRoundForm = Form.create()(AddRoundForm);

export default class AddRoundModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      noEnd: true,
      data: {},
      dic_project_round: []
    };

    this.formUtils = new FormUtils("addRoundModal");
  }
  componentWillMount() {
    this.decision = new Decision();
    this.dictionary = new Dictionary();
    this.getDictionary();
  }
  componentDidMount() {}

  getDictionary() {
    this.dictionary.gets("dic_project_round").then(res => {
      if (res.success && res.result) {
        let state = this.state;

        res.result.map(item => {
          state[item.value] = item.selections;
        });

        this.setState(state);
      }
    });
  }
  show = (data = {}) => {
    this.setState({ visible: true, data }, () => {
      this.decision.isExist(data.projectId).then(res => {
        if (res.success) {
          this.setState({ noEnd: res.result });
        }
      });
      this.formUtils.setFieldsValue(data);
    });
  };
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    const { noEnd } = this.state;

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        if (noEnd) {
          const { dic_project_round } = this.state;

          const newRoundText = dic_project_round.find(
            round => round.value == formData.round
          ).label;

          const oldRoundText = dic_project_round.find(
            round => round.value == formData.oldRound
          ).label;

          Confirm({
            width: 450,
            wrapClassName: "showfloat vertical-center-modal",
            title: `新增[${newRoundText}]轮次后，现有的[${
              oldRoundText
            }]投决管理将自动结束并归档到立项投决页面底部。`,
            content: "确定执行该操作?",
            onOk: () => {
              this.decision.add(formData).then(res => {
                if (res.success) {
                  this.setState(
                    {
                      visible: false
                    },
                    () => {
                      this.formUtils.resetFields();
                    }
                  );
                  message.success("新增轮次成功");
                  this.props.reload && this.props.reload(res.result);
                }
              });
            }
          });
        } else {
          this.decision.add(formData).then(res => {
            if (res.success) {
              this.setState(
                {
                  visible: false
                },
                () => {
                  this.formUtils.resetFields();
                }
              );
              message.success("新增轮次成功");
              this.props.reload && this.props.reload(res.result);
            }
          });
        }
      }
    });
  };

  render() {
    const { callback } = this.props;
    const { visible, dic_project_round } = this.state;
    return (
      <Modal
        visible={visible}
        title="新增轮次"
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
      >
        <WrappedAddRoundForm
          round={dic_project_round}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
          callback={callback}
        />
      </Modal>
    );
  }
}
