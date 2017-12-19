import React, { Component } from "react";

import moment from "moment";

import {
  Layout,
  Form,
  Tabs,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Button,
  Row,
  Col,
  Icon,
  DatePicker
} from "antd";

const InputGroup = Input.Group;
const TextArea = Input.TextArea
const { Option } = Select;

const { MonthPicker, RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const FormItem = Form.Item;

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import NumberRange from "./NumberRange";
import SearchSelect from "./SearchSelect";
import Upload from "../upload/";

import Address from "./Address";

import style from "./DynamicFormItem.scss";

class DynamicFormItem extends Base {
  state = {
    provinceData: [],
    cityData: []
  };
  componentWillMount() {
    this.formUtils = this.props.formUtils;
    const that = this;
  }

  renderField(field) {
    const { fieldConfigDto } = field;
    const elementsTypeList = {
      text: field => {
        return this.formUtils.getFieldDecorator(field.name, {
          initialValue: (fieldConfigDto && fieldConfigDto.initValue) || null,
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        })(<Input  placeholder={`请输入${field.label}`} type="text" />);
      },
      textarea: field => {
        return this.formUtils.getFieldDecorator(field.name, {
          initialValue: (fieldConfigDto && fieldConfigDto.initValue) || null,
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        })(<TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder={`请输入${field.label}`} className={style.textarea}  />);
      },
      image: field => {

        const initValue =
          field.imageDtos &&
          field.imageDtos.map(image => {
            image.uid = image.id;
            image.status = "done";
            return image;
          });

        const assets = this.formUtils.getFieldValue(field.name) || [];

        const max = 9;

        return (
          <div className="dynamic_image">
            {this.formUtils.getFieldDecorator(field.name, {
              initialValue: initValue || [],
              validateTrigger: ["onChange", "onBlur"],
              rules: this.getRules(field)
            })(<Input type="hidden" />)}
            <ul className={"images"}>
              {
                <li>
                  <Upload
                    showUploadList={false}
                    max={1}
                    accept="png,jpg,jpeg,gif"
                    onSave={file => {
                      const assets = this.formUtils.getFieldValue(field.name);
                      assets.push({
                        url: file.url,
                        name: file.name,
                        id: file.response.result.id
                      });
                      let data = {};
                      data[field.name] = assets;
                      this.formUtils.setFieldsValue(data);
                    }}
                  >
                    <Button
                      icon="plus"
                      disabled={
                        this.formUtils.getFieldValue(field.name).length <
                        max ? (
                          false
                        ) : (
                          true
                        )
                      }
                    >
                      {this.formUtils.getFieldValue(field.name).length == 0 ? (
                        "添加图片"
                      ) : this.formUtils.getFieldValue(field.name).length ==
                      max ? (
                        `只允许添加${max}张`
                      ) : (
                        "继续添加"
                      )}
                    </Button>
                  </Upload>
                </li>
              }
              {this.formUtils.getFieldValue(field.name).map(item => {
                return (
                  <li className="image">
                    <a target="_blank" href={item.url}>
                      <span className="name">{item.name}</span>
                    </a>
                    <div>
                      <span
                        className="del"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          const assets = this.formUtils.getFieldValue(
                            field.name
                          );
                          let data = {};
                          data[field.name] = assets.filter(
                            asset => asset.url != item.url
                          );
                          this.formUtils.setFieldsValue(data);
                        }}
                      >
                        删除
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );

      },
      date: field => {
        const onChange = (date, datestr) => {
          let data = {};
          data[field.name] = new Date(datestr);
          this.formUtils.setFieldsValue(data);
        };
        let initValue = null;
        if (fieldConfigDto && fieldConfigDto.initValue) {
          initValue = moment(fieldConfigDto.initValue);
        }
        return this.formUtils.getFieldDecorator(field.name, {
          initialValue: initValue,
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        })(
          <DatePicker
            getCalendarContainer={() =>
              document.getElementById(`${field.name}_FormItem`)}
          />
        );
      },
      date_range: field => {
        let range =
          fieldConfigDto &&
          fieldConfigDto.initValue &&
          fieldConfigDto.initValue.split(",") || [null,null]
        if (range && range.length) {
          range = [
            range[0] ? moment(range[0]) : null,
            range[1] ? moment(range[1]) : null
          ];
        }

        return this.formUtils.getFieldDecorator(field.name, {
          initialValue: range,
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        })(
          <RangePicker
            getCalendarContainer={() =>
              document.getElementById(`${field.name}_FormItem`)}
          />
        );
      },
      select: field => {
        const options = {
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        };
        if (fieldConfigDto && fieldConfigDto.initValue) {
          options.initialValue = fieldConfigDto && fieldConfigDto.initValue;
        }
        return this.formUtils.getFieldDecorator(field.name, options)(
          <Select
            allowClear
            placeholder="请选择"
            getPopupContainer={() =>
              document.getElementById(`${field.name}_FormItem`)}
          >
            {field.selectDtos &&
              field.selectDtos.map(item => {
                return (
                  <Option key={item.value} value={item.value.toString()}>
                    {item.label}
                  </Option>
                );
              })}
          </Select>
        );
      },
      radio: field => {
        return this.formUtils.getFieldDecorator(field.name, {
          initialValue: (fieldConfigDto && fieldConfigDto.initValue) || null,
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        })(
          <RadioGroup>
            {field.selectDtos &&
              field.selectDtos.map(item => {
                return (
                  <Radio key={item.value} value={item.value.toString()}>
                    {item.label}
                  </Radio>
                );
              })}
          </RadioGroup>
        );
      },
      checkbox: field => {
        const options = field.selectDtos;
        let range =
          (fieldConfigDto &&
            fieldConfigDto.initValue &&
            fieldConfigDto.initValue.split(",")) ||
          null;
        if (range && range.length) {
          range = range.filter(
            item =>
              options.map(option => option.value.toString()).indexOf(item) > -1
          );
        }
        options.map(option => {
          option.value = option.value.toString();
          return option;
        });
        return this.formUtils.getFieldDecorator(field.name, {
          initialValue: range,
          validateTrigger: ["onChange", "onBlur"],
          rules: this.getRules(field)
        })(<CheckboxGroup options={options} />);
      },
      number: field => {
        const initValue = fieldConfigDto && fieldConfigDto.initValue;
        const onChange = value => {
          let data = {};
          data[field.name] = value;
          this.formUtils.setFieldsValue(value);
          this.formUtils.trigger(field.name, "onChange");
        };
        return (
          <div className="ant-input-group">
            {this.formUtils.getFieldDecorator(field.name, {
              initialValue: initValue || null,
              validateTrigger: ["onChange", "onBlur"],
              rules: this.getRules(field)
            })(
              <InputNumber
              placeholder={`${field.label}`}
                precision={field.numberDto && field.numberDto.decimalLength}
              />
            )}
            {field.numberDto && field.numberDto.unit}
          </div>
        );
      },
      search_select: field => {
        return (
          <div
            style={{
              width: "100%"
            }}
          >
            {this.formUtils.getFieldDecorator(field.name, {
              initialValue:
                (fieldConfigDto && fieldConfigDto.initValue) || null,
              validateTrigger: ["onChange", "onBlur"],
              rules: this.getRules(field)
            })(<Input type="hidden" />)}
            <SearchSelect
              initData={{
                label: fieldConfigDto && fieldConfigDto.initValueText,
                value: fieldConfigDto && fieldConfigDto.initValue
              }}
              placeholder={`请输入并选择${field.label}`}
              label={field.label}
              request={field.request}
              formUtils={this.formUtils}
              format={field.format}
              name={field.name}
            />
          </div>
        );
      },
      number_range: field => {
        const range =
          (fieldConfigDto &&
            fieldConfigDto.initValue &&
            fieldConfigDto.initValue.split(",")) ||
          [];
        return (
          <div
            style={{
              width: "100%",
              display: "flex"
            }}
          >
            <NumberRange
              errortemp={field.label}
              formUtils={this.formUtils}
              required={field.isMandatory}
              name={field.name}
              startValue={range[0] || null}
              endValue={range[1] || null}
              precision={field.numberDto && field.numberDto.decimalLength}
              min={fieldConfigDto && fieldConfigDto.minValue}
              max={fieldConfigDto && fieldConfigDto.maxValue}
            />
            <div>{field.numberDto && field.numberDto.unit}</div>
          </div>
        );
      },
      address: field => {
        const initValue = fieldConfigDto && fieldConfigDto.initValue;
        return (
          <div>
            {this.formUtils.getFieldDecorator(field.name, {
              initialValue: initValue || null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: field.isMandatory === 1 ? true : false,
                  message: `请填写${field.label}`
                }
              ]
            })(<Input type="hidden" />)}
            <Address
              formUtils={this.formUtils}
              name={field.name}
              required={field.isMandatory === 1 ? true : false}
              initValue={initValue}
            />
          </div>
        );
      }
    };
    return elementsTypeList[field.typeCode](field);
  }

  getRules = field => {
    const { typeCode, fieldConfigDto } = field;

    let baseRule = {
      required: field.isMandatory === 1 ? true : false,
      whitespace: true,
      message: `请输入${field.label}`
    };

    switch (typeCode) {
      case "text":
        baseRule.min = fieldConfigDto && fieldConfigDto.minLength;
        baseRule.max = fieldConfigDto && fieldConfigDto.maxLength;
        baseRule.message = null;
        baseRule.validator = (rule, value, callback) => {
          value = value && value.trim();
          if (baseRule.required && !value) {
            callback(`请输入${field.label}`);
          }
          if (baseRule.min && value) {
            if (value.length < baseRule.min) {
              callback(`请输入大于${baseRule.min}长度的${field.label}`);
            }
          }
          if (baseRule.max && value) {
            if (value.length > baseRule.max) {
              callback(`请输入小于${baseRule.max}长度的${field.label}`);
            }
          }
          callback();
        };
        break;
      case "number":
        baseRule.min = fieldConfigDto && fieldConfigDto.minValue;
        baseRule.max = fieldConfigDto && fieldConfigDto.maxValue;
        baseRule.type = "string";
        baseRule.transform = value => {
          if (value) {
            return value.toString();
          }
        };
        baseRule.validator = (rule, value, callback) => {
          value = value && value.toString().trim();
          if (baseRule.required && !value) {
            callback(`请输入${field.label}`);
          }
          value = Number(value);
          if (baseRule.min && value) {
            if (value < baseRule.min) {
              callback(`请输入大于${baseRule.min}的${field.label}`);
            }
          }
          if (baseRule.max && value) {
            if (value > baseRule.max) {
              callback(`请输入小于${baseRule.max}的${field.label}`);
            }
          }
          callback();
        };
        baseRule.message = `请输入${field.label}`;
        break;

      case "checkbox":
        baseRule.type = `array`;
        baseRule.message = `请选择${field.label}`;
        break;
      case "select":
        baseRule.message = `请选择${field.label}`;
        break;
      case "date":
        baseRule.type = "object";
        baseRule.message = `请选择${field.label}`;
        break;
      case "radio":
        baseRule.message = `请选择${field.label}`;
        break;
      case "date_range":
        baseRule.type = "array";
        baseRule.message = `请选择${field.label}`;
        break;
      case "image":
        baseRule.message = `请选择图片上传`;
        baseRule.type = "array";
        break;

      default:
        break;
    }

    return [baseRule];
  };
  render() {
    const { field, ...others } = this.props;
    const { fieldConfigDto } = field;
    return (
      <div id={`${field.name}_FormItem`}>
        <FormItem
          label={field.label}
          required={field.isMandatory === 1 ? true : false}
          {...others}
        >
          {this.renderField(field)}
        </FormItem>
      </div>
    );
  }
}

export default DynamicFormItem;
