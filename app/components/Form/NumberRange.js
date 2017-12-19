import React, { Component } from "react";
import { Input, Form, InputNumber, Col } from "antd";
import FormUtils from "lib/formUtils";

const InputGroup = Input.Group;
const FormItem = Form.Item;

class NumberRange extends Input {
  state = {
    help: "",
    validateStatus: "success"
  };
  constructor(props) {
    super(props);
    this.state = {
      startValue: this.props.startValue || null,
      endValue: this.props.endValue || null
    };
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils;
  }
  validate = (rule, value, callback) => {
    const {
      name,
      errortemp,
      required,
      startRequired,
      endRequired
    } = this.props;
    const initMin = this.props.min || 0;
    const initMax = this.props.max || 9999999999;

    let help = null,
      validateStatus = "success";
    let startValue = this.state.startValue;
    let endValue = this.state.endValue;
    if (required) {
      //必须的选项 前后 都得有值  并且前面的 小于后面的
      if (!startValue || !endValue) {
        help = `请填写${errortemp}`;
        validateStatus = "error";
      }
    }

    if (startRequired && !startValue) {
      validateStatus = "error";
      help = `请填写${errortemp}的起始值`;
    }
    if (endRequired && !endValue) {
      validateStatus = "error";
      help = `请填写${errortemp}的结束值`;
    }

    if (startValue) {
      startValue = Number(startValue);
      if (startValue < initMin) {
        help = `起始${errortemp}需大于等于${initMin}`;
        validateStatus = "error";
      }
      if (startValue > Math.min(initMax, endValue || initMax)) {
        help = `起始${errortemp}需小于${Math.min(initMax, endValue)}`;
        validateStatus = "error";
      }
    }

    if (endValue) {
      endValue = Number(endValue);
      if (endValue < Math.max(initMin, startValue || initMin)) {
        help = `结束${errortemp}需大于等于${Math.max(initMin, startValue)}`;
        validateStatus = "error";
      }
      if (endValue > initMax) {
        help = `结束${errortemp}需小于${initMax}`;
        validateStatus = "error";
      }
    }


    this.setState(
      {
        help: help,
        validateStatus
      },
      () => {
        let data = {};
        data[this.props.name] = [];
        if (startValue) {
          data[this.props.name].push(startValue);
        }
        if (endValue) {
          data[this.props.name].push(endValue);
        }
        if (data[this.props.name].length) {
          data[this.props.name] = data[this.props.name].join(",");
        } else {
          delete data[this.props.name];
        }
        this.formUtils.setFieldsValue(data);

        if (help) {
          callback(help);
        } else {
          callback();
        }
      }
    );
  };
  onStartChange = value => {
    this.setState(
      {
        startValue: value
      },
      () => {
        this.formUtils.trigger(this.props.name, "onChange");
      }
    );
  };
  onEndChange = value => {
    this.setState(
      {
        endValue: value
      },
      () => {
        this.formUtils.trigger(this.props.name, "onChange");
      }
    );
  };
  render() {
    const { name, required, startRequird, endRequired } = this.props;
    const value = this.formUtils.getFieldValue(name);
    let initValue = [];
    const { startValue, endValue } = this.state;
    if (startValue) {
      initValue.push(startValue);
    }
    if (endValue) {
      initValue.push(endValue);
    }
    if (initValue.length) {
      initValue = initValue.join(",");
    } else {
      initValue = null;
    }

    const that = this;
    return (
      <div className={`ant-row ant-form-item  ${this.state.validateStatus ==
        "error"
          ? "ant-form-item-with-help"
          : ""}`}>
        <div className="ant-form-item-control-wrapper">
          <div
            className={`ant-form-item-control ${this.state.validateStatus ==
            "error"
              ? "has-error"
              : ""}`}
          >
            {this.formUtils.getFieldDecorator(`${name}`, {
              initialValue: initValue,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: required,
                  validator: this.validate
                }
              ]
            })(<Input type="hidden" />)}
            <InputGroup>
              <InputNumber
                style={{
                  textAlign: "center",
                  flex:1
                }}
                step={this.props.step}
                defaultValue={this.state.startValue}
                onChange={this.onStartChange}
                placeholder=""
              />
              <span className="ant-number-range-separator" style={{width:40,textAlign:'center'}}>≤n&lt;</span>
              <InputNumber
                defaultValue={this.state.endValue}
                onChange={this.onEndChange}
                step={this.props.step}
                style={{
                  textAlign: "center",
                  flex:1
                }}
                placeholder=""
              />
            </InputGroup>
            <div className="ant-form-explain">
              {this.state.help}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default NumberRange;
