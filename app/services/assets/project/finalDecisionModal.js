import React from "react";
import ReactDOM from "react-dom";
import {
  AutoComplete,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  message
} from "antd";

import Base from "components/main/Base";
import SearchSelect from "components/Form/SearchSelect";

import FormUtils from "lib/formUtils";

import Dictionary from "model/dictionary";
import Decision from "model/Project/decision";
import Assets from "model/Assets/index";

import style from "./finalDecisionModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

class FinalDecisionForm extends Base {
  constructor() {
    super();
    this.state = {
      autoCompleteResult: [],
      dic_project_investment_level: [],
      dic_project_investment_type: []
    };

    this.formUtils = new FormUtils("FinalDecisionForm");
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.assets = new Assets();

    this.getDictionary();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this);
  }
  getDictionary() {
    this.dictionary
      .gets("dic_project_investment_level,dic_project_investment_type")
      .then(res => {
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
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    };

    const { data } = this.props;
    const {
      dic_project_investment_level,
      dic_project_investment_type,
      requireRemark = true
    } = this.state;

    let investOrNot = this.formUtils.getFieldValue("investOrNot");

    return (
      <Form className={`float-slide-form vant-spin follow-form`}>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("decisionId", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="是否出资" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("investOrNot", {
            initialValue: null,
            rules: [
              {
                required: true,
                message: "请选择是否出资"
              }
            ]
          })(
            <Select
              getPopupContainer={() => this.container}
              size="large"
              allowClear={true}
              placeholder="请选择是否出资"
              onChange={value => {
                this.setState({ requireRemark: value != 1 }, () => {
                  value !== 0 && this.formUtils.trigger("remark", "onChange");
                });
              }}
            >
              <Option key={1} value={0}>
                放弃出资
              </Option>
              <Option key={2} value={1}>
                决定出资
              </Option>
            </Select>
          )}
        </FormItem>
        {investOrNot === 1 ? (
          <div>
            <FormItem label="投资主体" {...formItemLayout}>
              <div id={"fundId_FormItem"}>
                <SearchSelect
                  name="fundId"
                  placeholder="请输入并选择基金"
                  request={this.assets.fund_get_selection}
                  initData={{
                    label: data.fundName,
                    value: data.fundId
                  }}
                  format={r => {
                    r.value = r.id;
                    r.label = r.name;
                    return r;
                  }}
                  callback={value => {
                    const id = value ? value.key : "";
                    this.formUtils.setFieldsValue({ fundId: id });
                  }}
                />

                {this.props.formUtils.getFieldDecorator("fundId", {
                  initialValue: data.fundId,
                  rules: [
                    {
                      required: true,
                      message: "请输入并选择基金"
                    }
                  ]
                })(<Input type="hidden" />)}
              </div>
            </FormItem>
            <FormItem label="投资金额" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("investmentAmount", {
                initialValue: data.investmentAmount,
                validateTrigger: ["onBlur"],
                rules: [
                  {
                    required: true,
                    type: "string",
                    whitespace: true,
                    message: "请输入投资金额"
                  }
                ]
              })(<InputNumber size="large" min={0} precision={0} />)}万
            </FormItem>
            <FormItem label="投资占股比例" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("shareRatio", {
                initialValue: data.shareRatio,
                validateTrigger: ["onBlur"],
                rules: [
                  {
                    required: true,
                    type: "string",
                    whitespace: true,

                    message: "请输入投资占股比例(0-100)"
                  }
                ]
              })(<InputNumber size="large" min={0} max={100} precision={2} />)}%
            </FormItem>
            <FormItem label="投前估值" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("valuationBefore", {
                initialValue: data.valuationBefore
              })(<InputNumber size="large" min={0} precision={0} />)}万
            </FormItem>
            <FormItem label="领投/跟股" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("investLevel", {
                initialValue: data.investLevel,
                rules: [
                  {
                    min: 0,
                    message: "请输入大于零值"
                  }
                ]
              })(
                <Select
                  getPopupContainer={() => this.container}
                  size="large"
                  allowClear={true}
                  placeholder="请选择"
                >
                  {dic_project_investment_level &&
                    dic_project_investment_level.map(item => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      );
                    })}
                </Select>
              )}
            </FormItem>
            <FormItem label="投后估值" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("valuationAfter", {
                initialValue: data.valuationAfter
              })(<InputNumber size="large" min={0} precision={0} />)}万
            </FormItem>
            <FormItem label="投资方式" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("investType", {
                initialValue: data.investType
              })(
                <Select
                  getPopupContainer={() => this.container}
                  size="large"
                  allowClear={true}
                  placeholder="请选择"
                >
                  {dic_project_investment_type &&
                    dic_project_investment_type.map(item => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      );
                    })}
                </Select>
              )}
            </FormItem>
          </div>
        ) : null}
        <FormItem label="备注" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("remark", {
            initialValue: data.remark,
            rules: [
              {
                required: requireRemark,
                type: "string",
                whitespace: true,
                message: "请填写长度不超过200个字符",
                min: 1,
                max: 200
              }
            ]
          })(<Input type="textarea" rows={3} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

const WrappedFinalDecisionForm = Form.create()(FinalDecisionForm);

export default class FinalDecisionModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("finalDecisionModal");
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

        this.decision.finalDecision(formData).then(res => {
          if (res.success) {
            this.setState({
              visible: false
            });
            message.success("最终决定保存成功");
            this.props.reload && this.props.reload();
          }
        });
      }
    });
  };

  render() {
    const { industry, source, callback } = this.props;
    const { visible, formData } = this.state;
    return (
      <Modal
        visible={visible}
        title="最终决定"
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        maskClosable={false}
      >
        <WrappedFinalDecisionForm
          data={formData}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
