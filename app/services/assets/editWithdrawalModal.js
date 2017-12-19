import React, { Component } from "react";
import ReactDOM from "react-dom";
import {
  Select,
  Input,
  DatePicker,
  Button,
  Modal,
  Form,
  Spin,
  InputNumber,
  Icon,
  message
} from "antd";
import moment from "moment";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";
import SearchSelect from "components/Form/SearchSelect";

import Assets from "model/Assets/index";
import Withdrawal from "model/Assets/withdrawal";
import Dictionary from "model/dictionary";

import style from "./EditWithdrawalModal.scss";

const TextArea = Input.TextArea;
const FormItem = Form.Item;
const Option = Select.Option;

class EditWithdrawalForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      filters: {}
    };
    this.formUtils = new FormUtils("editWithdrawalForm");
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.assets = new Assets();
    this.dictionary = new Dictionary();
  }

  componentDidMount() {
    const { fundId } = this.props.data;

    this.getDictionary();
    this.getProject(fundId);
  }

  getDictionary() {
    this.dictionary.gets("dic_withdrawal_type").then(res => {
      if (res.success && res.result) {
        let filters = this.state;
        res.result.map(item => {
          filters[item.value] = item.selections;
        });

        this.setState({ filters });
      }
    });
  }

  getProject(fundId) {
    console.log("fundId", fundId);
    this.assets
      .get_select_investment({
        fundId
      })
      .then(res => {
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
    let formUtils;
    formUtils = this.formUtils;

    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    this.formItemLayout = formItemLayout;

    const { data, visible } = this.props;

    const { dic_withdrawal_type, dic_project } = this.state.filters;

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
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: data.id
          })(<Input type="hidden" />)}
          <FormItem
            label="退出基金"
            style={{ display: data.fundId ? "none" : "block" }}
            {...formItemLayout}
          >
            {visible ? (
              <SearchSelect
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
                  this.getProject(id);
                }}
                popupContainer={this.container}
                name="productId"
              />
            ) : null}
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
          <FormItem label="退出项目" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("projectId", {
              rules: [
                {
                  required: true,
                  message: "请选择项目"
                }
              ]
            })(
              <Select
                getPopupContainer={() => this.container}
                size="large"
                allowClear={true}
                placeholder="请选择项目"
                disabled={data.projectId ? true : false}
              >
                {dic_project &&
                  dic_project.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>

          <FormItem label="退出方式" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("withdrawalType", {
              rules: [
                {
                  required: true,
                  message: "请选择退出方式"
                }
              ]
            })(
              <Select
                getPopupContainer={() => this.container}
                size="large"
                allowClear={true}
                placeholder="请选择退出方式"
              >
                {dic_withdrawal_type &&
                  dic_withdrawal_type.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>

          <FormItem label="退出价格" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("withdrawalAmount", {
              initialValue: "",
              validateTrigger: ["onBlur"],
              rules: [
                {
                  required: true,
                  message: "请输入退出价格"
                }
              ]
            })(
              <InputNumber
                size="large"
                min={0}
                max={999999999}
                placeholder="请输入退出价格"
              />
            )}万
          </FormItem>
          <FormItem label="退出股份" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("withdrawalShareRatio", {
              initialValue: "",
              validateTrigger: ["onBlur"],
              rules: [
                {
                  required: true,
                  message: "输入范围0-100"
                }
              ]
            })(
              <InputNumber
                min={0}
                max={100}
                precision={2}
                size="large"
                placeholder="请输入退出股份"
              />
            )}%
          </FormItem>
          <FormItem label="退出日期" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("withdrawalDate", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"]
            })(
              <DatePicker
                getCalendarContainer={() => this.container}
                size="large"
                placeholder="退出日期"
              />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}
EditWithdrawalForm = Form.create()(EditWithdrawalForm);

class EditWithdrawalModal extends Base {
  constructor() {
    super();
    this.state = {
      visible: false,
      formData: {}
    };
    this.formUtils = new FormUtils("editWithdrawalModal");
  }
  componentWillMount() {
    this.withdrawal = new Withdrawal();
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show(data = {}) {
    if (data.withdrawalType) {
      data.withdrawalType = data.withdrawalType.toString();
    }

    if (data.withdrawalDate) {
      data.withdrawalDate = moment(data.withdrawalDate);
    }

    this.setState(
      {
        visible: true,
        formData: data
      },
      () => {
        if (this.form) {
          this.formUtils.resetFields();
          this.formUtils.setFieldsValue(data);
        }
      }
    );
  }

  handleSetForm(form) {
    this.form = form;
  }

  handleSubmit = e => {
    e && e.preventDefault();
    this.formUtils.validateFields(errors => {
      if (!errors) {
        const values = this.formatData(this.formUtils.getFieldsValue());

        let request = values.id ? this.withdrawal.update : this.withdrawal.add;
        //基金详情新增出资入口
        if (!values.id && values.fundId) {
          request = this.withdrawal.add_fund;
        }

        this.setState({ confirmLoading: true });

        request(values).then(res => {
          this.setState({ confirmLoading: false });

          if (res.success) {
            message.success(
              `${this.state.formData.id ? "编辑" : "新增"}退出成功`
            );
            this.setState({ visible: false });
            this.props.reload && this.props.reload(values);
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
  render() {
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };
    this.formUtils = this.props.formUtils || this.formUtils;

    return (
      <Modal
        title={(this.state.formData.id ? "编辑" : "新增") + "退出"}
        visible={this.state.visible}
        confirmLoading={this.state.confirmLoading}
        maskClosable={false}
        width={552}
        className={`vant-modal ${style.modal} yundao-modal`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleCancel}
        onOk={this.handleSubmit}
      >
        <EditWithdrawalForm
          isInModal={true}
          formUtils={this.formUtils}
          visible={this.state.visible}
          data={this.state.formData}
          setForm={form => this.handleSetForm(form)}
        />
      </Modal>
    );
  }
}

export default EditWithdrawalModal;
