import React from "react";
import ReactDOM from "react-dom";
import {
  Button,
  Form,
  Select,
  Input,
  Modal,
  message,
  InputNumber,
  AutoComplete
} from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Assets from "model/Assets/index";
import Dictionary from "model/dictionary";
import Product from "model/Product/index";

import style from "./addRoundModal.scss";

import SearchSelect from "components/Form/SearchSelect";

const FormItem = Form.Item;
const Option = Select.Option;

const AutoCompleteOption = AutoComplete.Option;

class AddAdviceForm extends Base {
  state = {
    filters: {},
    autoCompleteResult: []
  };
  constructor(props) {
    super(props);
    this.formUtils = new FormUtils("AddAdviceForm");
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.dictionary = new Dictionary();
    this.assets = new Assets();
    this.getDictionary();
  }
  getDictionary() {
    this.dictionary.gets("dic_project_investment_source").then(res => {
      if (res.success && res.result) {
        let filters = {};
        res.result.map(item => {
          filters[item.value] = item.selections;
        });

        this.setState({ filters });
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
    const { autoCompleteResult, filters } = this.state;
    const { dic_project_investment_source } = filters;

    const { data } = this.props;

    return (
      <Form
        className={`float-slide-form vant-spin follow-form`}
        ref={ref => (this.container = ReactDOM.findDOMNode(ref))}
      >
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("finacingRoundId", {})(
            <Input type="hidden" />
          )}
        </FormItem>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: null
          })(<Input type="hidden" />)}
        </FormItem>

        <FormItem label="投资来源" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("investmentSource", {
            rules: [
              {
                required: true,
                message: "请选择投资来源"
              }
            ]
          })(
            <Select
              getPopupContainer={() => this.container}
              size="large"
              allowClear={true}
              placeholder="请选择投资来源"
              disabled={data.id ? true : false}
            >
              {dic_project_investment_source &&
                dic_project_investment_source.map(item => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>

        {this.props.formUtils.getFieldValue("investmentSource") == 1 ? (
          <FormItem label="基金名称" {...formItemLayout}>
            <div id={"productId_FormItem"}>
              {this.props.visible ? (
                <SearchSelect
                  placeholder="请输入并选择基金"
                  request={this.assets.fund_get_selection}
                  disabled={data.id ? true : false}
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
                  name="productId"
                />
              ) : null}
              {this.formUtils.getFieldDecorator("fundId", {
                initialValue: data.id,
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  {
                    required: true,
                    message: "请输入并选择基金"
                  }
                ]
              })(<Input type="hidden" />)}
            </div>
          </FormItem>
        ) : (
          <FormItem label="投资方名称" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("fundName", {
              validateTrigger: ["onChange", "onBlur"],
              initialValue: data.fundName,
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
            })(
              <Input
                size="large"
                disabled={data.id ? true : false}
                placeholder="请输入投资方名称"
              />
            )}
          </FormItem>
        )}
        <FormItem label="投资金额" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("investmentAmount", {
            rules: [
              {
                required: true,
                message: "请填写投资金额"
              }
            ]
          })(<InputNumber size="large" />)}万
        </FormItem>
        <FormItem label="占股比例" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("shareRatio", {
            validateTrigger: ["onBlur"],
            rules: [
              {
                required: true,
                message: "请填写占股比例"
              }
            ]
          })(<InputNumber precision={2} size="large" />)}%
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
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("addAdviceModal");
  }
  componentWillMount() {
    this.assets = new Assets();
  }
  componentDidMount() {}
  show = (data = {}) => {
    this.setState(
      { visible: true, data, isEdit: data.id ? true : false },
      () => {
        this.formUtils.resetFields();
        if (data.investmentSource) {
          data.investmentSource = data.investmentSource.toString();
        }
        console.log("data", data);
        this.formUtils.setFieldsValue(data);
      }
    );
  };
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();
    const { isEdit } = this.state;
    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();
        const request = isEdit
          ? this.assets.financing_update_info
          : this.assets.financing_add_info;
        request(formData).then(res => {
          if (res.success) {
            this.setState({
              visible: false
            });
            message.success(`${isEdit ? "编辑" : "新增"}投资方成功`);
            this.props.reload && this.props.reload();
          }
        });
      }
    });
  };

  render() {
    const { industry, source, callback } = this.props;
    const { visible, isEdit } = this.state;
    return (
      <Modal
        visible={visible}
        title={`${isEdit ? "编辑" : "新增"}投资方`}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        closable={false}
      >
        <WrappedAddAdviceForm
          visible={visible}
          data={this.state.data}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
          callback={callback}
        />
      </Modal>
    );
  }
}
