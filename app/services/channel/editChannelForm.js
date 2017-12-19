import React from "react";
import {
  Select,
  Input,
  DatePicker,
  Button,
  Form,
  Row,
  Col,
  Icon,
  Tooltip,
  Radio
} from "antd";
import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Channel from "model/Channel/";
import Dictionary from "model/dictionary";

const FormItem = Form.Item;
const Option = Select.Option;
const Textarea = Input.Textarea;
const RadioGroup = Radio.Group;

import style from "./editChannelModal.scss";

import constCitys from "const/citys";

class EditChannelForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      showExtra: false,
      dic: {},
      category: []
    };

    this.formUtils = new FormUtils("EditChannelForm");
  }
  componentWillMount() {
    this.channel = new Channel();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    const dictionary = new Dictionary();
    dictionary
      .gets(
        "dic_customer_level,dic_customer_source,dic_channel_company_type,dic_channel_company_pro_type"
      )
      .then(res => {
        if (res.success && res.result) {
          let dic = {};
          res.result.map(item => {
            dic[item.value] = item;
          });

          this.setState({ dic });
        }
      });

    this.setState({ provinceData: constCitys, cityData: [] });
  }

  getDicSelections(ChildComponent, code) {
    return (
      this.state.dic[code] &&
      this.state.dic[code].selections &&
      this.state.dic[code].selections.map(item => {
        return code == "dic_customer_invest_type" && item.value == 2 ? (
          <ChildComponent
            value={item.value}
            disabled={
              code == "dic_customer_invest_type" && item.value == 2 ? true : false
            }
            key={item.value}
          >
            <Tooltip title="需要上传资产证明后才可以选择">
              <p>{item.label}</p>
            </Tooltip>
          </ChildComponent>
        ) : (
          <ChildComponent value={item.value} key={item.value}>
            {item.label}
          </ChildComponent>
        );
      })
    );
  }
  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }

  handleProvinceChange = value => {
    const { provinceData } = this.state;

    if (value) {
      const cityData = provinceData
        ? provinceData.filter(item => item.value == value)[0].children
        : [];
      this.setState({ cityData: cityData });
      this.formUtils.setFieldsValue({
        cityCode: cityData && cityData.length ? cityData[0].value : null
      });
    } else {
      this.setState({ cityData: [] });
      this.formUtils.resetFields(["cityCode"]);
    }
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    return (
      <div
        id="customer_form"
        style={{
          position: "relative"
        }}
      >
        <Form className={this.getFormClassName()}>
          <FormItem label="渠道名称" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("name", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入1-30长度的渠道名称",
                  min: 1,
                  max: 30
                }
              ]
            })(<Input placeholder="请输入渠道名称" />)}
          </FormItem>
          <FormItem label="电话号码" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("mobile", {
              rules: [
                {
                  validator: (rules, value, callback) => {
                    if (!value) {
                      callback();
                      return false;
                    }
                    value = value.replace(/(^\s*)|(\s*)$/g, "");
                    if (!value) {
                      callback("请填写电话号码");
                      // } else if (/^[0-9]{6,20}$/.test(value)) {
                      //   this.customer.check_mobile(value).then(r => {
                      //     if (r && r.success) {
                      //       callback();
                      //     } else {
                      //       callback(r.message);
                      //     }
                      //   });
                    } else if (value.length < 6) {
                      callback("电话号码过短");
                    } else if (value.length > 20) {
                      callback("电话号码超出长度限制");
                    } else {
                      callback();
                    }
                  }
                }
              ],
              validateTrigger: "onBlur"
            })(<Input placeholder="请输入电话号码" />)}
          </FormItem>
          <FormItem label="重要级别" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("level")(
              <Select
                getPopupContainer={() =>
                  document.getElementById("customer_form")
                }
                size="large"
                allowClear={true}
                placeholder="请选择重要级别"
              >
                {this.getDicSelections(Option, "dic_customer_level")}
              </Select>
            )}
          </FormItem>

          <FormItem label="类型" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("investTypes")(
              <Select
                getPopupContainer={() =>
                  document.getElementById("customer_form")
                }
                allowClear={true}
                size="large"
                placeholder="请选择类型"
              >
                {this.getDicSelections(Option, "dic_channel_company_type")}
              </Select>
            )}
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("remark", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过200个字符",
                  min: 1,
                  max: 200
                }
              ]
            })(<Input type="textarea" rows={3} size="large" />)}
          </FormItem>

          <FormItem
            label={
              <a
                style={{
                  cursor: "pointer",
                  display: "inline"
                }}
                onClick={e => {
                  this.setState({
                    showExtra: !this.state.showExtra
                  });
                }}
              >
                {!this.state.showExtra ? "填写更多信息>>" : "收起"}
              </a>
            }
            {...formItemLayout}
          />
          {this.state.showExtra ? (
            <div
              style={{
                display: this.state.showExtra ? "block" : "none"
              }}
            >
              <FormItem label="来源" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("source")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    placeholder="请选择客户来源"
                    allowClear={true}
                    size="large"
                  >
                    {this.getDicSelections(Option, "dic_customer_source")}
                  </Select>
                )}
              </FormItem>
              <FormItem label="邮箱" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("email", {
                  initialValue: null,
                  rules: [
                    {
                      type: "email",
                      whitespace: true,
                      message: "邮箱格式不正确"
                    },
                    {
                      message: "长度不能超过50个字符",
                      max: 50
                    }
                  ]
                })(<Input />)}
              </FormItem>
              <FormItem label="省份/城市" {...formItemLayout}>
                <Row gutter={10}>
                  <Col span="11">
                    <FormItem>
                      {this.formUtils.getFieldDecorator("provinceCode")(
                        <Select
                          getPopupContainer={() =>
                            document.getElementById("customer_form")
                          }
                          allowClear={true}
                          onChange={this.handleProvinceChange}
                          placeholder="请选择"
                        >
                          {this.state.provinceData.map(item => {
                            return (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span="12">
                    <FormItem>
                      {this.formUtils.getFieldDecorator("cityCode")(
                        <Select
                          getPopupContainer={() =>
                            document.getElementById("customer_form")
                          }
                          allowClear={true}
                          placeholder="请选择"
                        >
                          {this.state.cityData.map(item => {
                            return (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="地址" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("address", {
                  initialValue: null,
                  rules: [
                    {
                      whitespace: true,
                      message: "长度不能超过100个字符",
                      max: 100
                    }
                  ]
                })(<Input />)}
              </FormItem>
              <FormItem label="公司名称" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("company", {
                  initialValue: null,
                  rules: [
                    {
                      whitespace: true,
                      message: "长度不能超过100个字符",
                      max: 100
                    }
                  ]
                })(<Input />)}
              </FormItem>
              <FormItem label="公司产品类型" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("companyProductTypes")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    placeholder="请选择公司产品类型"
                    allowClear={true}
                    size="large"
                  >
                    {this.getDicSelections(
                      Option,
                      "dic_channel_company_pro_type"
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label="职务" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("position", {
                  initialValue: null,
                  rules: [
                    {
                      whitespace: true,
                      message: "长度不能超过20个字符",
                      max: 20
                    }
                  ]
                })(<Input />)}
              </FormItem>
            </div>
          ) : null}
        </Form>
      </div>
    );
  }
}
EditChannelForm = Form.create()(EditChannelForm);

export default EditChannelForm;
