import React, { Component } from "react";
import {
  Button,
  Icon,
  DatePicker,
  Form,
  Radio,
  Select,
  Input,
  Row,
  Col,
  Affix,
  message
} from "antd";

const FormItem = Form.Item;

const Option = Select.Option;
const RadioGroup = Radio.Group;

import style from "./customerDetail.scss";

import Customer from "model/Customer/";
import Dictionary from "model/dictionary";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

import moment from "moment";

import extend from "extend";

import Upload from "components/upload/";

import constCitys from "const/citys";

import EditCustomerTagModal from "../editCustomerTagModal";

const NAME = "CustomerBaseInfoForm";

class CustomerDetailBaseInfoForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      dic: {}
    };
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    const dictionary = new Dictionary();
    dictionary
      .gets(
        "dic_customer_level,dic_customer_invest_type,dic_customer_credentials,dic_sex,dic_custom" +
          "er_source,dic_customer_risk_rating"
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
    const { cityCode, provinceCode } = this.props.data;
    const cityData =
      provinceCode && cityCode
        ? constCitys.filter(item => item.value == provinceCode)[0].children
        : [];
    this.setState({ provinceData: constCitys, cityData: cityData });
  }
  getDicSelections(ChildComponent, code) {
    return (
      this.state.dic[code] &&
      this.state.dic[code].selections &&
      this.state.dic[code].selections.map(item => {
        return (
          <ChildComponent value={item.value} key={item.value}>
            {item.label}
          </ChildComponent>
        );
      })
    );
  }
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded
    // render
    if (nextProps.data !== this.state.data) {
      const data = this.formatData(nextProps.data);
      this.setState(
        {
          data
        },
        () => {
          if (this.formUtils) {
            this.formUtils.resetFields();
            this.formUtils.setFieldsValue(data);
          }
        }
      );
    }
  }
  formatData = values => {
    return values;
  };
  render() {
    const { data } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };
    const { provinceData } = this.state;

    const handleProvinceChange = value => {
      if (value) {
        const cityData = provinceData.filter(item => item.value == value)[0]
          .children;
        this.setState({ cityData: cityData });
        this.formUtils.setFieldsValue({ cityCode: cityData[0].value });
      }
    };
    return (
      <div id="CustomerBaseInfoForm">
        <Form>
          <FormItem label="客户名称" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("name", {
              initialValue: data.name
            })(<Input />)}
          </FormItem>
          <FormItem label="性别" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("sex", {
              initialValue: data.sex && data.sex.toString()
            })(
              <RadioGroup>{this.getDicSelections(Radio, "dic_sex")}</RadioGroup>
            )}
          </FormItem>
          <FormItem label="重要级别" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("level", {
              initialValue: data.level ? data.level.toString() : null
            })(
              <Select
                getPopupContainer={() =>
                  document.getElementById("CustomerBaseInfoForm")
                }
                size="large"
                allowClear={true}
                placeholder="请选择"
              >
                {this.getDicSelections(Option, "dic_customer_level")}
              </Select>
            )}
          </FormItem>
          {this.formUtils.getFieldDecorator("tags", {
            initialValue: data.tags
          })(<Input type="hidden" />)}
          <FormItem label="标签" {...formItemLayout}>
            <Row>
              <Col span={20}>{this.formUtils.getFieldValue("tags")}</Col>

              <Col span={4}>
                <Button
                  className={style.ant_btn_plus}
                  onClick={() =>
                    this.editCustomerTagModal.show({
                      tags: this.formUtils.getFieldValue("tags")
                    })
                  }
                >
                  <Icon type="plus" />
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem label="来源" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("source", {
              initialValue: data.source ? data.source.toString() : null
            })(
              <Select
                placeholder="请选择客户来源"
                size="large"
                allowClear={true}
                getPopupContainer={() =>
                  document.getElementById("CustomerBaseInfoForm")
                }
              >
                {this.getDicSelections(Option, "dic_customer_source")}
              </Select>
            )}
          </FormItem>
          <FormItem label="证件类型" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("certType", {
              initialValue: data.certType ? data.certType.toString() : null
            })(
              <Select
                placeholder="请选择证件类型"
                size="large"
                allowClear={true}
                getPopupContainer={() =>
                  document.getElementById("CustomerBaseInfoForm")
                }
              >
                {this.getDicSelections(Option, "dic_customer_credentials")}
              </Select>
            )}
          </FormItem>
          <FormItem label="证件号码" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("certNo", {
              initialValue: data.certNo
            })(<Input />)}
          </FormItem>
          <FormItem label="证件正反面" {...formItemLayout}>
            <ul className={style.images}>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("certFront", {
                  initialValue: data.certFront
                })(<Input type="hidden" />)}
                <Upload
                  accept="png,jpg,jpeg,gif"
                  showUploadList={false}
                  max={1}
                  onSave={file => {
                    this.formUtils.setFieldsValue({ certFront: file.url });
                  }}
                >
                  {this.formUtils.getFieldValue("certFront") ? (
                    <div className={style.uploaded}>
                      <img
                        src={this.formUtils.getFieldValue("certFront")}
                        alt="证件正面"
                      />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.formUtils.setFieldsValue({ certFront: "" });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传正面</p>
                    </div>
                  )}
                </Upload>
              </li>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("certBack", {
                  initialValue: data.certBack
                })(<Input type="hidden" />)}
                <Upload
                  showUploadList={false}
                  accept="png,jpg,jpeg,gif"
                  max={1}
                  onSave={file => {
                    this.formUtils.setFieldsValue({ certBack: file.url });
                  }}
                >
                  {this.formUtils.getFieldValue("certBack") ? (
                    <div className={style.uploaded}>
                      <img
                        src={this.formUtils.getFieldValue("certBack")}
                        alt="证件反面"
                      />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.formUtils.setFieldsValue({ certFront: "" });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传反面</p>
                    </div>
                  )}
                </Upload>
              </li>
            </ul>
          </FormItem>
          <FormItem label="资产证明" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("assets", {
              initialValue: data.assets || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("assets").map(item => {
                return (
                  <li className={style.image}>
                    <div className={style.uploaded}>
                      <img src={item.url} alt="资产证明" />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const assets = this.formUtils.getFieldValue(
                              "assets"
                            );
                            this.formUtils.setFieldsValue({
                              assets: assets.filter(
                                asset => asset.url != item.url
                              )
                            });
                          }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
              {this.formUtils.getFieldValue("assets").length < 9 ? (
                <li className={style.image}>
                  <Upload
                    accept="png,jpg,jpeg,gif"
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let assets = this.formUtils.getFieldValue("assets");
                      assets.push({ url: file.url, name: file.name });
                      this.formUtils.setFieldsValue({ assets: assets });
                    }}
                  >
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传照片</p>
                    </div>
                  </Upload>
                </li>
              ) : null}
            </ul>
          </FormItem>
          <FormItem label="备注" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("remark", {
              initialValue: data.remark,
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
          <FormItem label="省份/城市" {...formItemLayout}>
            <Row>
              <Col span="12">
                <FormItem>
                  {this.formUtils.getFieldDecorator("provinceCode", {
                    initialValue: data.provinceCode || null
                  })(
                    <Select
                      onChange={handleProvinceChange}
                      placeholder="请选择"
                      getPopupContainer={() => document.getElementById(NAME)}
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
                  {this.formUtils.getFieldDecorator("cityCode", {
                    initialValue:
                      data.provinceCode && data.cityCode ? data.cityCode : null
                  })(
                    <Select
                      placeholder="请选择"
                      getPopupContainer={() => document.getElementById(NAME)}
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
              initialValue: data.address
            })(<Input />)}
          </FormItem>
          <FormItem label="行业" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("trade", {
              initialValue: data.trade
            })(<Input />)}
          </FormItem>
          <FormItem label="机构" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("organization", {
              initialValue: data.organization
            })(<Input />)}
          </FormItem>
          <FormItem label="职务" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("position", {
              initialValue: data.position
            })(<Input />)}
          </FormItem>
        </Form>
        <EditCustomerTagModal
          formUtils={this.formUtils}
          submit={value => {
            this.formUtils.setFieldsValue(value);
          }}
          ref={ref => (this.editCustomerTagModal = ref)}
        />
      </div>
    );
  }
}

CustomerDetailBaseInfoForm = Form.create()(CustomerDetailBaseInfoForm);

export default class CustomerDetailBaseInfo extends Base {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.customer = new Customer();
    this.formUtils = new FormUtils(NAME);
  }
  state = {
    isEdit: false
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
      //加载不同的资料 设置为非编辑状态
      this.setState({
        isEdit: false
      });
    }
  }

  submit = () => {
    const { data, mod } = this.props;
    let values = false;
    this.formUtils.validateFields(errors => {
      if (!errors) {
        values = this.formUtils.getFieldsValue();

        values = this.formatData(values);
        values.assets = JSON.stringify(values.assets);
        values.id = data.id;

        const info = JSON.parse(JSON.stringify(data.info.data));

        //foarmat 原有的info信息

        info.investTypes =
          info.investTypes && info.investTypes.length
            ? info.investTypes
                .map(item => item.productTypeId.toString())
                .join(",")
            : null;

        const bank = info && info.banks && info.banks[0];
        if (bank) {
          info.bankAccount = bank.account;
          info.bankName = bank.bankName;
          info.bankFront = bank.front;
          info.bankBack = bank.back;
        }

        delete info.credential;
        delete info.attachDtos;
        delete info.banks;
        values = extend(info, values);
        this.customer.update_info(values).then(res => {
          if (res && res.success) {
            message.success("更新身份资料成功");

            mod.loadData();
            mod.refreshGrid && mod.refreshGrid();

            this.setState({ isEdit: false });
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
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        values[key] = v;
      }
    }

    return values;
  }
  render() {
    const { data } = this.props;
    if (!data) {
      return null;
    }

    const canEdit = data.info.permission.editPermission;
    const canRead = data.info.permission.readPermission;
    let info = JSON.parse(JSON.stringify(data.info.data));
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const tags = info.tags.map(item => item.name).join(",");

    info.certType = info.credential ? info.credential.type : null;
    info.certNo = info.credential ? info.credential.number : null;
    info.level = info.level ? info.level.toString() : null;
    info.source = info.source ? info.source.toString() : null;
    info.certType = info.certType ? info.certType.toString() : null;
    info.certFront = info.credential ? info.credential.front : null;
    info.certBack = info.credential ? info.credential.back : null;
    info.assets = info.attachDtos;
    info.tags = tags;
    info.birthday = info.birthday ? moment(info.birthday) : null;

    return (
      <div className={style.card}>
        <div className={style.header}>
          <div className={style.title}>基本资料</div>
        </div>
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <CustomerDetailBaseInfoForm
              data={info}
              formUtils={this.formUtils}
            />
          ) : (
            <Form>
              <FormItem label="客户名称" {...formItemLayout}>
                {info.name}
              </FormItem>
              <FormItem label="电话号码" {...formItemLayout}>
                {info.telephone}
              </FormItem>
              <FormItem label="机构类型" {...formItemLayout}>
                {info.orgTypeText}
              </FormItem>
              <FormItem label="重要级别" {...formItemLayout}>
                {info.levelText}
              </FormItem>
              <FormItem label="标签" {...formItemLayout}>
                {info.tags}
              </FormItem>
              <FormItem label="来源" {...formItemLayout}>
                {info.sourceText}
              </FormItem>
              <FormItem label="网址" {...formItemLayout}>
                {info.website}
              </FormItem>
              <FormItem label="经营范围" {...formItemLayout}>
                {info.business}
              </FormItem>
              <FormItem label="注册地址" {...formItemLayout}>
                {info.registeredAddress}
              </FormItem>
              <FormItem label="办公地址" {...formItemLayout}>
                {info.officeAddress}
              </FormItem>
              <FormItem label="注册资本" {...formItemLayout}>
                {info.registeredCapital}
              </FormItem>
              <FormItem label="实际控制人" {...formItemLayout}>
                {info.personInCharge}
              </FormItem>
              <FormItem label="机构规模" {...formItemLayout}>
                {info.scaleText}
              </FormItem>
              <FormItem label="备注" {...formItemLayout}>
                {info.remark}
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
