import React, { Component } from "react";
import {
  Button,
  Icon,
  message,
  Form,
  Input,
  InputNumber,
  Row,
  Col
} from "antd";

import FormUtils from "lib/formUtils";

import Receipt from "model/Finance/receipt";

import style from "./Index.scss";

const FormItem = Form.Item;

function formatMoney(value) {
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class UpdatePlanForm extends Component {
  constructor() {
    super();

    this.state = {
      isEdit: false
    };

    this.formUtils = new FormUtils("updatePlanForm");
  }
  componentWillMount() {
    this.setState({ data: this.props.data });

    this.receipt = new Receipt();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      console.log("nextProps.data", nextProps.data);
      this.setState({
        data: nextProps.data
      });
    }
  }
  /**
   * 检查回款计划名是否已存在
   *
   * @memberof AddPlanForm
   */
  checkExist = (rule, value, callback) => {
    if (!value) {
      callback();
    } else {
      let data = {
        id: this.props.data.id,
        name: value
      };
      this.receipt.checkExistForUpdate(data).then(res => {
        res.result ? callback("回款计划名称已存在") : callback();
      });
    }
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
  handleEdit = () => {
    this.setState({ isEdit: true });
  };
  handleCancel = () => {
    this.setState({ isEdit: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.receipt.update(formData).then(res => {
          if (res.success) {
            message.success("更新成功");

            let data = Object.assign(this.state.data, formData);

            this.setState({
              isEdit: false,
              data
            });
          }
        });
      }
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
    const { data } = this.state;
    const { isEdit } = this.state;

    return (
      <Form className={isEdit ? "" : style.viewDetail}>
        <Row>
          <Col span={12}>
            <FormItem style={{ display: "none" }}>
              {this.formUtils.getFieldDecorator("id", {
                initialValue: data.id
              })(<Input type="hidden" />)}
            </FormItem>
            <FormItem wrapperCol={{ span: 21 }}>
              {isEdit ? (
                this.formUtils.getFieldDecorator("name", {
                  initialValue: data.name,
                  validateTrigger: ["onBlur"],
                  rules: [
                    {
                      required: true,
                      type: "string",
                      whitespace: true,
                      message: "请填写长度不超过30个字符",
                      min: 1,
                      max: 30
                    },
                    {
                      validator: this.checkExist
                    }
                  ]
                })(<Input placeholder="请输入回款计划名称" />)
              ) : (
                <span className={style.planName}>{data.name}</span>
              )}
            </FormItem>
          </Col>
          <Col>
            {isEdit ? (
              <div className={style.icons}>
                <img
                  className="anticon"
                  src="/assets/images/icon/取消@1x.png"
                  onClick={this.handleCancel}
                />
                <img
                  className="anticon"
                  src="/assets/images/icon/确认@1x.png"
                  onClick={this.handleSubmit}
                />
              </div>
            ) : (
              <div className={style.icons}>
                <img
                  className="anticon"
                  src="/assets/images/icon/编辑@1x.png"
                  onClick={this.handleEdit}
                />
              </div>
            )}
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="回款产品" {...formItemLayout}>
              {formatMoney(data.productName)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              className={style.bigLabel}
              label="计划回款金额"
              {...formItemLayout}
            >
              {isEdit
                ? this.formUtils.getFieldDecorator("amount", {
                    initialValue: data.amount,
                    validateTrigger: ["onBlur"],
                    rules: [
                      {
                        required: true,
                        message: "请输入计划回款金额"
                      },
                      {
                        pattern: new RegExp("^\\d+(\\.[1-9]{1,2})?$"),
                        message: "必须大于0,最多两位小数"
                      }
                    ]
                  })(<InputNumber min={0} />)
                : formatMoney(data.amount)}元
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="回款单位" {...formItemLayout}>
              {isEdit
                ? this.formUtils.getFieldDecorator("payUnit", {
                    initialValue: data.payUnit,
                    rules: [
                      {
                        type: "string",
                        whitespace: true,
                        message: "请填写长度不超过50个字符",
                        max: 50
                      }
                    ],
                    validateTrigger: "onBlur"
                  })(<Input />)
                : data.payUnit}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              className={style.bigLabel}
              label="实际回款金额"
              {...formItemLayout}
            >
              {formatMoney(data.actualReceiptAmount)}元
            </FormItem>
          </Col>
        </Row>
        <Row>
          <FormItem label="备注" {...formItemLayout}>
            {isEdit
              ? this.formUtils.getFieldDecorator("remark", {
                  initialValue: data.remark,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      type: "string",
                      whitespace: true,
                      message: "请填写长度不超过200个字符",
                      max: 200
                    }
                  ]
                })(<Input type="textarea" rows={3} size="large" />)
              : data.remark}
          </FormItem>
        </Row>
      </Form>
    );
  }
}

const WrappedUpdatePlanForm = Form.create()(UpdatePlanForm);

export default class DetailHead extends Component {
  constructor(props) {
    super(props);

    this.formUtils = new FormUtils("updatePlanForm");
  }
  componentWillMount() {
    this.receipt = new Receipt();
  }
  render() {
    const { data } = this.props;
    return (
      <div className={style.header}>
        <WrappedUpdatePlanForm
          data={data}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
        />
      </div>
    );
  }
}
