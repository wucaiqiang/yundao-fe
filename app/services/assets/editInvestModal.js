import React from "react";
import ReactDOM from "react-dom";
import {
  Select,
  Input,
  Form,
  DatePicker,
  InputNumber,
  Modal,
  message
} from "antd";
import moment from "moment";

import Base from "components/main/Base";
import SearchSelect from "components/Form/SearchSelect";

import FormUtils from "lib/formUtils";

import Dictionary from "model/dictionary";
import Assets from "model/Assets/index";
import Investment from "model/Assets/investment";

import style from "./editInvestModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

class EditInvestForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false
    };

    this.formUtils = new FormUtils("EditInvestForm");
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

  componentDidMount() {}
  getDictionary() {
    this.dictionary
      .gets(
        "dic_project_investment_level,dic_project_investment_type,dic_project_round"
      )
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

  getProject(fundId) {
    console.log("fundId", fundId);
    this.assets.get_select_investment().then(res => {
      if (res.success && res.result) {
        let filters = this.state;
        filters["dic_project"] = res.result.datas.map(item => {
          return {
            label: item.name,
            value: item.id
          };
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
        span: 17
      }
    };

    const { data = {}, investment, visible } = this.props;
    const {
      dic_project_investment_level,
      dic_project_investment_type,
      dic_project_round
    } = this.state;

    return (
      <div
        style={{
          position: "relative"
        }}
        ref={ref => {
          this.container = ReactDOM.findDOMNode(ref);
        }}
      >
        <Form className="float-slide-form vant-spin follow-form">
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("id", {
              initialValue: data.id
            })(<Input type="hidden" />)}
          </FormItem>
          {visible ? (
            <FormItem
              label="出资基金"
              {...formItemLayout}
              style={{ display: data.fundId ? "none" : "block" }}
            >
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
                  
                  r.disabled=!r.editPermission
                  r.label = r.disabled? `${r.name}(没有该基金的编辑权限)`: r.name;
                  return r;
                }}
                callback={value => {
                  const id = value ? value.key : "";
                  this.formUtils.setFieldsValue({ fundId: id });
                }}
                popupContainer={this.container}
                name="productId"
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
            </FormItem>
          ) : null}
          {visible ? (
            <FormItem label="投资项目" {...formItemLayout}>
              <SearchSelect
                name="projectId"
                placeholder="请输入并选择项目"
                disabled={data.projectId ? true : false}
                request={investment.get_project}
                initData={{
                  label: data.projectName,
                  value: data.projectId
                }}
                format={r => {
                  r.value = r.id;
                  r.label = r.name;
                  return r;
                }}
                callback={value => {
                  const id = value ? value.key : "";
                  this.formUtils.setFieldsValue({ projectId: id });
                }}
                popupContainer={this.container}
              />

              {this.props.formUtils.getFieldDecorator("projectId", {
                initialValue: data.projectId,
                rules: [
                  {
                    required: true,
                    message: "请输入并选择项目"
                  }
                ]
              })(<Input type="hidden" />)}
            </FormItem>
          ) : null}
          <FormItem label="投资轮次" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("round", {
              initialValue: data.round,
              rules: [
                {
                  required: true,
                  message: "请选择投资轮次"
                }
              ]
            })(
              <Select
                getPopupContainer={() => this.container}
                size="large"
                allowClear={true}
                placeholder="请选择"
                disabled={data.projectId ? true : false}
              >
                {dic_project_round &&
                  dic_project_round.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem label="投资金额" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("investAmount", {
              initialValue: data.investAmount,
              rules: [
                {
                  required: true,
                  type: "number",
                  whitespace: true,
                  message: "请输入投资金额"
                }
              ]
            })(<InputNumber size="large" min={0} precision={0} />)}万
          </FormItem>
          <FormItem label="投资占股比例" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("shareRatio", {
              initialValue: "",
              rules: [
                {
                  required: true,
                  type: "number",
                  whitespace: true,
                  message: "请输入投资占股比例(0-100)"
                }
              ]
            })(<InputNumber size="large" min={0} max={100} precision={2} />)}%
          </FormItem>
          <FormItem label="领投/跟股" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("investLevel", {
              initialValue: data.investLevel
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
          <FormItem label="投前估值" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("valuationBefore", {
              initialValue: data.valuationBefore
            })(<InputNumber size="large" min={0} precision={0} />)}万
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

          <FormItem label="出资日期" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("investDate", {
              initialValue: data.investDate
            })(
              <DatePicker
                format="YYYY-MM-DD"
                getCalendarContainer={() => this.container}
              />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrapperedEditInvestForm = Form.create()(EditInvestForm);

export default class EditInvestModal extends Base {
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

    this.formUtils = new FormUtils("editInvestModal");
  }
  componentWillMount() {
    this.investment = new Investment();
  }
  componentDidMount() {}
  show(data = {}) {
    if (data.round) {
      data.round = data.round.toString();
    }
    if (data.investLevel) {
      data.investLevel = data.investLevel.toString();
    }
    if (data.investType) {
      data.investType = data.investType.toString();
    }
    if (data.investDate) {
      data.investDate = moment(data.investDate);
    }

    this.setState({ visible: true, formData: data }, () => {
      if (this.form) {
        this.formUtils.resetFields();
        this.formUtils.setFieldsValue(data);
      }
    });
  }
  handleClose = () => {
    this.setState({ visible: false }, () => {
      this.formUtils.resetFields();
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
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm:ss");
        }
        values[key] = v;
      }
    }
    return values;
  }
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formatData(this.formUtils.getFieldsValue());

        let request = formData.id
          ? this.investment.update
          : this.investment.add;

        //基金详情新增出资入口
        if (!formData.id && formData.fundId) {
          request = this.investment.add_fund;
        }

        this.setState({ confirmLoading: true });

        request(formData).then(res => {
          this.setState({ confirmLoading: false });

          if (res.success) {
            message.success(
              `${this.state.formData.id ? "编辑" : "新增"}出资成功`
            );

            this.props.reload && this.props.reload();

            this.setState(
              {
                visible: false
              },
              () => {
                this.formUtils.resetFields();
              }
            );
          }
        });
      }
    });
  };

  render() {
    const { visible, confirmLoading, formData } = this.state;
    return (
      <Modal
        width={600}
        visible={visible}
        confirmLoading={confirmLoading}
        title={(formData.id ? "编辑" : "新增") + "出资"}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        maskClosable={false}
      >
        <WrapperedEditInvestForm
          formUtils={this.formUtils}
          visible={visible}
          data={formData}
          investment={this.investment}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
