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

import Notice from "model/Product/notice";
import Customer from "model/Customer/";

import EnumCustomer from "enum/enumCustomer";

import EditCustomerTagModal from "./editCustomerTagModal";

import Dictionary from "model/dictionary";
import Category from "model/Product/category";

import style from "./editCustomerModal.scss";

import constCitys from "const/citys";

const FormItem = Form.Item;
const Option = Select.Option;
const Textarea = Input.Textarea;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;

const { EnumCustomerType } = EnumCustomer;

class EditCustomerForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      noticeType: [],
      showExtra: false,
      dic: {},
      category: []
    };

    this.formUtils = new FormUtils("EditCustomerForm");
  }
  componentWillMount() {
    this.notice = new Notice();
    this.customer = new Customer();
    this.setState({ noticeType: this.props.noticeType });

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    const dictionary = new Dictionary();
    dictionary
      .gets(
        "dic_customer_level,dic_customer_invest_type,dic_customer_credentials,dic_sex,dic_customer_source,dic_customer_risk_rating,dic_customer_buy_type,dic_source,dic_org_type,dic_org_scale,dic_org_credentials_type,dic_nationality"
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

    const category = new Category();
    category.get_all().then(res => {
      if (res.success && res.result) {
        this.setState({
          category: res.result.map(item => {
            return { label: item.name, value: item.id };
          })
        });
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
  handleChange = value => {
    if (value == "0") {
      this.formUtils.resetFields(["sendTime"]);
    }
  };

  handleUploadChange = file => {};
  handleUploadRemove = file => {};

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

    let customerType = this.formUtils.getFieldValue("customerType");

    return (
      <div
        id="customer_form"
        style={{
          position: "relative"
        }}
      >
        <Form className={this.getFormClassName()}>
          <FormItem label="客户类型" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("customerType", {
              initialValue: "1"
            })(
              <RadioGroup>
                {this.getDicSelections(Radio, "dic_customer_buy_type")}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label="客户名称" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("name", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入1-20长度的客户名称",
                  min: 1,
                  max: 20
                }
              ]
            })(<Input placeholder="请输入客户名称" />)}
          </FormItem>
          {customerType === EnumCustomerType.enum.PERSON ? (
            <div>
              <FormItem label="手机号码" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("mobile", {
                  rules: [
                    {
                      required: true,
                      validator: (rules, value, callback) => {
                        if (!value) {
                          callback("请填写手机号码");
                          return false;
                        }
                        value = value.replace(/(^\s*)|(\s*)$/g, "");
                        if (!value) {
                          callback("请填写手机号码");
                        } else if (/^[0-9]{6,20}$/.test(value)) {
                          this.customer.check_mobile(value).then(r => {
                            if (r && r.success) {
                              callback();
                            } else {
                              callback(r.message);
                            }
                          });
                        } else if (value.length < 6) {
                          callback("手机号码过短");
                        } else if (value.length > 20) {
                          callback("手机号码超出长度限制");
                        } else {
                          callback("请输入正确的手机号码");
                        }
                      }
                    }
                  ],
                  validateTrigger: "onBlur"
                })(<Input placeholder="请输入客户手机号" />)}
              </FormItem>
              <FormItem label="性别" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("sex", { initialValue: 0 })(
                  <RadioGroup>
                    {this.getDicSelections(Radio, "dic_sex")}
                  </RadioGroup>
                )}
              </FormItem>
            </div>
          ) : (
            <div>
              <FormItem label="电话号码" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("mobile", {
                  rules: [
                    {
                      required: true,
                      validator: (rules, value, callback) => {
                        if (!value) {
                          callback("请填写电话号码");
                          return false;
                        }
                        value = value.replace(/(^\s*)|(\s*)$/g, "");
                        if (!value) {
                          callback("请填写电话号码");
                        } else if (/^[0-9]{6,20}$/.test(value)) {
                          this.customer.check_mobile(value).then(r => {
                            if (r && r.success) {
                              callback();
                            } else {
                              callback(r.message);
                            }
                          });
                        } else if (value.length < 6) {
                          callback("号码过短");
                        } else if (value.length > 20) {
                          callback("号码超出长度限制");
                        } else {
                          callback("请输入正确的电话号码");
                        }
                      }
                    }
                  ],
                  validateTrigger: "onBlur"
                })(<Input placeholder="请输入电话号码" />)}
              </FormItem>
              <FormItem label="机构类型" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("orgType")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    allowClear={true}
                    size="large"
                    placeholder="请选择机构类型"
                  >
                    {this.getDicSelections(Option, "dic_org_type")}
                  </Select>
                )}
              </FormItem>
            </div>
          )}

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
          <FormItem label="标签" {...formItemLayout}>
            <Row>
              <Col span={20}>
                {this.formUtils.getFieldValue("tags")}
                {this.formUtils.getFieldDecorator("tags")(
                  <Input type="hidden" />
                )}
              </Col>
              <Col span={4}>
                <Button
                  className={"ant_btn_plus"}
                  onClick={() => this.editCustomerTagModal.show()}
                >
                  <Icon type="plus" />
                </Button>
              </Col>
            </Row>
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
              <FormItem label="投资偏好" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("investTypes")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    allowClear={true}
                    size="large"
                    mode={"multiple"}
                    placeholder="请选择投资偏好"
                  >
                    {this.state.category.map(item => {
                      return (
                        <Option value={item.value} key={item.value}>
                          {item.label}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem label="投资人类型" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("type")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    allowClear={true}
                    size="large"
                    placeholder="请选择投资人类型"
                  >
                    {this.getDicSelections(Option, "dic_customer_invest_type")}
                  </Select>
                )}
              </FormItem>
              <FormItem label="风险特征" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("riskRating")(
                  <Select
                    getPopupContainer={() =>
                      document.getElementById("customer_form")
                    }
                    allowClear={true}
                    size="large"
                    placeholder="请选择风险特征"
                  >
                    {this.getDicSelections(Option, "dic_customer_risk_rating")}
                  </Select>
                )}
              </FormItem>

              {customerType === EnumCustomerType.enum.PERSON ? (
                <div>
                  <FormItem label="出生日期" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("birthday")(
                      <DatePicker
                        style={{
                          width: 200
                        }}
                        format="YYYY-MM-DD"
                      />
                    )}
                  </FormItem>
                  <FormItem label="微信" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("wechat", {
                      initialValue: null,
                      rules: [
                        {
                          whitespace: true,
                          message: "输入长度范围限制6-20位",
                          min: 6,
                          max: 20
                        }
                      ]
                    })(<Input />)}
                  </FormItem>
                  <FormItem label="座机号码" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("telephone", {
                      initialValue: null,
                      rules: [
                        {
                          whitespace: true,
                          message: "请填写长度为6-20位",
                          min: 6,
                          max: 20
                        }
                      ]
                    })(<Input />)}
                  </FormItem>
                  <FormItem label="国籍" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("nationality", {
                      initialValue: null
                    })(
                      <Select
                        getPopupContainer={() =>
                          document.getElementById("customer_form")
                        }
                        placeholder="请选择国籍"
                        allowClear={true}
                        size="large"
                      >
                        {this.getDicSelections(Option, "dic_nationality")}
                      </Select>
                    )}
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
                  <FormItem label="证件类型" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("card")(
                      <Select
                        getPopupContainer={() =>
                          document.getElementById("customer_form")
                        }
                        placeholder="请选择证件类型"
                        allowClear={true}
                        size="large"
                      >
                        {this.getDicSelections(
                          Option,
                          "dic_customer_credentials"
                        )}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label="证件号码" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("cardId", {
                      initialValue: null,
                      rules: [
                        {
                          whitespace: true,
                          message: "请填写长度为6-20位",
                          min: 6,
                          max: 20
                        }
                      ]
                    })(<Input />)}
                  </FormItem>
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
                  <FormItem label="职业" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("profession", {
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
                  <FormItem label="行业" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("trade", {
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
                  <FormItem label="机构" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("organization", {
                      initialValue: null,
                      rules: [
                        {
                          type: "string",
                          whitespace: true,
                          message: "长度不能超过50个字符",
                          min: 1,
                          max: 50
                        }
                      ]
                    })(<Input />)}
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
                  <FormItem label="QQ" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("qq", {
                      initialValue: null,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          pattern: /^[0-9]{1,20}$/,
                          message: "长度不能超过20位数字"
                        }
                      ]
                    })(<Input />)}
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
                </div>
              ) : (
                <div>
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
                  <FormItem label="网址" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("website", {
                      initialValue: null,
                      rules: [
                        {
                          type: "url",
                          whitespace: true,
                          message: "网址格式不正确"
                        },
                        {
                          message: "长度不能超过100个字符",
                          max: 100
                        }
                      ]
                    })(<Input />)}
                  </FormItem>
                  <FormItem label="经营范围" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("business", {
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
                  <FormItem label="注册地址" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("registeredAddress", {
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
                  <FormItem label="办公地址" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("officeAddress", {
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
                  <FormItem label="注册资本" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("registeredCapital", {
                      initialValue: null,
                      rules: [
                        {
                          whitespace: true,
                          message: "长度不能超过10个字符",
                          max: 10
                        }
                      ]
                    })(<Input />)}
                  </FormItem>

                  <FormItem label="实际控制人" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("personInCharge", {
                      initialValue: null,
                      rules: [
                        {
                          whitespace: true,
                          message: "长度不能超过10个字符",
                          max: 10
                        }
                      ]
                    })(<Input />)}
                  </FormItem>
                  <FormItem label="机构规模" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("scale")(
                      <Select
                        getPopupContainer={() =>
                          document.getElementById("customer_form")
                        }
                        placeholder="请选择机构规模"
                        allowClear={true}
                        size="large"
                      >
                        {this.getDicSelections(Option, "dic_org_scale")}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label="证件类型" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("card")(
                      <Select
                        getPopupContainer={() =>
                          document.getElementById("customer_form")
                        }
                        placeholder="请选择证件类型"
                        allowClear={true}
                        size="large"
                      >
                        {this.getDicSelections(
                          Option,
                          "dic_org_credentials_type"
                        )}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label="证件号码" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("cardId", {
                      initialValue: null,
                      rules: [
                        {
                          whitespace: true,
                          message: "输入长度限制6-20位",
                          min: 6,
                          max: 20
                        }
                      ]
                    })(<Input />)}
                  </FormItem>
                  <FormItem label="证件有效期" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator("expireDate", {
                      initialValue: null
                    })(<RangePicker format={"YYYY-MM-DD"} />)}
                  </FormItem>
                  <FormItem label="资质证书编号" {...formItemLayout}>
                    {this.formUtils.getFieldDecorator(
                      "qualificationCertificateNumber",
                      {
                        initialValue: null,
                        rules: [
                          {
                            whitespace: true,
                            message: "输入长度限制6-20位",
                            min: 6,
                            max: 20
                          }
                        ]
                      }
                    )(<Input />)}
                  </FormItem>
                </div>
              )}
            </div>
          ) : null}
        </Form>
        {this.props.visible ? (
          <EditCustomerTagModal
            formUtils={this.formUtils}
            submit={value => {
              this.formUtils.setFieldsValue(value);
            }}
            ref={ref => (this.editCustomerTagModal = ref)}
          />
        ) : null}
      </div>
    );
  }
}
EditCustomerForm = Form.create()(EditCustomerForm);

export default EditCustomerForm;
