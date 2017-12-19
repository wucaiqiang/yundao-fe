import React from "react";
import ReactDom from "react-dom";
import { Form, Input, Button, DatePicker, Select, Modal, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import Utils from 'utils/index'

import Operation from "model/Operation";
import Dictionary from "model/dictionary";
import Permission from "components/permission";



import style from "./modal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

function disabledDate(current) {
  // Can not select days before today and today
  return current && current.valueOf() < Date.now();
}

function disabledDateTime() {
  let time = Date();
  console.log(time)
  return {
    disabledHours: () => range(0, 24).splice(4, 20),
    disabledMinutes: () => range(30, 60),
    // disabledSeconds: () => [55, 56],
  };
}

class AllotForm extends Base {
  constructor() {
    super();

    this.state = {
      dictionary: {
        dic_user_visit_type: [],
        dic_user_visit_status: [],
        dic_customer_status: []
      }
    };

    this.formUtils = new FormUtils("allotForm");
  }
  componentWillMount() {
    this.operation = new Operation();
    this.dictionary = new Dictionary();

    this.getDictionary();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  getDictionary() {
    this.dictionary
      .gets("dic_user_visit_type,dic_user_visit_status,dic_customer_status")
      .then(res => {
        if (res.success && res.result) {
          let dictionary = {};
          res.result.map(item => {
            dictionary[item.value] = item.selections;
          });

          this.setState({ dictionary });
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

    const {
      dic_user_visit_type,
      dic_user_visit_status,
      dic_customer_status
    } = this.state.dictionary;

    const CustomerStatusForm = Permission(<div></div>)

    return (
      <div ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
        <Form className={`float-slide-form vant-spin follow-form`}>
          <FormItem style={{ display: "none" }}>
            {this.formUtils.getFieldDecorator("id", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="回访时间" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("visitDate", {
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "object",
                  message: "请选择回访时间"
                }
              ]
            })(
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择回访时间"
                // disabledDate={disabledDate}
                // disabledTime={disabledDateTime}
                showTime={true}
                getCalendarContainer={() => this.container}
              />
            )}
          </FormItem>
          <FormItem label="回访方式" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("type", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  message: "请选择回访方式"
                }
              ]
            })(
              <Select size="large" getPopupContainer={() => this.container}>
                {this.getOptions(dic_user_visit_type)}
              </Select>
            )}
          </FormItem>
          <FormItem label="回访状态" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("status", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  message: "请选择回访状态"
                }
              ]
            })(
              <Select size="large" getPopupContainer={() => this.container}>
                {this.getOptions(dic_user_visit_status)}
              </Select>
            )}
          </FormItem>
          <FormItem label="回访内容" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("content", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过200个字符",
                  min: 1,
                  max: 200
                }
              ]
            })(<Input type="textarea" rows={3} size="large" />)}
          </FormItem>

          {Utils.checkPermission('customer.update.status')?<FormItem label="客户状态" {...formItemLayout}>
    {this.formUtils.getFieldDecorator("customerStatus")(
      <Select size="large" getPopupContainer={() => this.container}>
        {this.getOptions(dic_customer_status)}
      </Select>
    )}
          </FormItem> :null}
          <FormItem label="下次回访时间" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("nextTime", {})(
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择下次回访时间"
                showTime={true}
                getCalendarContainer={() => this.container}
              />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedAllotForm = Form.create()(AllotForm);

export default class AllotModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false
    };

    this.formUtils = new FormUtils("allotModal");
  }
  componentWillMount() {
    this.operation = new Operation();
  }
  componentDidMount() {}
  show(data) {
    console.log('data',data)
    this.setState(
      {
        data,
        visible: true
      },
      () => {
        let visitDate = moment(new Date());
        data.customerStatus = data.customerStatus.toString()
        this.formUtils.setFieldsValue({ visitDate, ...data });
      }
    );
  }
  handleCancel = () => {
    this.formUtils.resetFields()
    this.setState({ visible: false });
  };
  handleOk = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();
        console.log('formData',formData)
        // return ;
        formData = this.formatData(formData);

        formData.id = this.state.data.id

        this.operation.allot(formData).then(res => {
          if (res.success) {
            message.success("回访保存成功");
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
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm");
        }
        values[key] = v;
      }
    }
    return values;
  }
  render() {
    let { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={`${this.state.data && this.state.data.customerName}的回访记录`}
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        okText="保存"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <WrappedAllotForm
          ref={form => (this.allotForm = form)}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </Modal>
    );
  }
}
