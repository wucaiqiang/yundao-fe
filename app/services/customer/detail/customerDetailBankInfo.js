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

import extend from "extend";

import style from "./customerDetail.scss";

import Customer from "model/Customer/";
import Dictionary from "model/dictionary";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

const NAME = "CustomerBankInfoForm";

import Upload from "components/upload/";

class CustomerDetailBankInfoForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      dic: {},
      category: []
    };
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
  }
  componentWillReceiveProps(nextProps) {
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

    return (
      <div id={NAME}>
        <Form>
          <FormItem label="银行卡帐号" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("bankAccount", {
              initialValue: data && data.bankAccount,
              rules: [
                {
                  min: 1,
                  max: 30,
                  message: "银行卡账号长度必须在1到30位之间"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="开户行" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("bankName", {
              initialValue: data && data.bankName
            })(<Input />)}
          </FormItem>
          <FormItem label="银行卡正反面" {...formItemLayout}>
            <ul className={style.images}>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("bankFront", {
                  initialValue: data && data.bankFront
                })(<Input type="hidden" />)}
                <Upload
                  accept="png,jpg,jpeg,gif"
                  showUploadList={false}
                  max={1}
                  onSave={file => {
                    this.formUtils.setFieldsValue({ bankFront: file.url });
                  }}
                >
                  {this.formUtils.getFieldValue("bankFront") ? (
                    <div className={style.uploaded}>
                      <img
                        src={this.formUtils.getFieldValue("bankFront")}
                        alt="银行卡正面"
                      />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.formUtils.setFieldsValue({ bankFront: "" });
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
                {this.formUtils.getFieldDecorator("bankBack", {
                  initialValue: data && data.bankBack
                })(<Input type="hidden" />)}
                <Upload
                  showUploadList={false}
                  max={1}
                  accept="png,jpg,jpeg,gif"
                  onSave={file => {
                    this.formUtils.setFieldsValue({ bankBack: file.url });
                  }}
                >
                  {this.formUtils.getFieldValue("bankBack") ? (
                    <div className={style.uploaded}>
                      <img
                        src={this.formUtils.getFieldValue("bankBack")}
                        alt="银行卡反面"
                      />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.formUtils.setFieldsValue({ bankBack: "" });
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
        </Form>
      </div>
    );
  }
}

CustomerDetailBankInfoForm = Form.create()(CustomerDetailBankInfoForm);

export default class CustomerDetailBankInfo extends Component {
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
      this.setState({ isEdit: false });
    }
  }

  submit = () => {
    const { data, mod } = this.props;
    let values = false;
    this.formUtils.validateFields(errors => {
      console.log(errors);
      if (!errors) {
        values = this.formUtils.getFieldsValue();

        values = this.formatData(values);
        values.birthday = values.birthday ? moment(values.birthday) : null;
        values.id = data.id;

        const info = JSON.parse(JSON.stringify(data.info.data));

        //foarmat 原有的info信息
        const tags = info.tags.map(item => item.name).join(",");
        info.certType = info.credential ? info.credential.type : null;
        info.certNo = info.credential ? info.credential.number : null;
        info.level = info.level ? info.level.toString() : null;
        info.source = info.source ? info.source.toString() : null;
        info.certType = info.certType ? info.certType.toString() : null;
        info.certFront = info.credential ? info.credential.front : null;
        info.certBack = info.credential ? info.credential.back : null;

        info.assets = JSON.stringify(
          info.attachDtos.map(item => {
            return { url: item.url, name: item.name };
          })
        );
        info.tags = tags;

        info.investTypes =
          info.investTypes && info.investTypes.length
            ? info.investTypes
                .map(item => item.productTypeId.toString())
                .join(",")
            : null;

        // const bank = info && info.banks && info.banks[0] if (bank) { info.bankAccount
        // = bank.account     info.bankAccount = bank.account info.bankFront =
        // bank.front     info.bankBack = bank.back }

        delete info.credential;
        delete info.attachDtos;
        delete info.banks;
        values = extend(info, values);
        this.customer.update_info(values).then(res => {
          if (res && res.success) {
            message.success("更新银行卡成功");
            // mod.reloading()
            mod.loadData();
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
        values[key] = v;
      }
    }

    return values;
  }
  genneratorFix = children => {
    const { mod } = this.props;
    return mod.state.visible ? (
      <Affix target={() => mod.affixContainer}>{children}</Affix>
    ) : (
      children
    );
  };
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

    const bank = info && info.banks && info.banks[0];
    if (bank) {
      bank.bankAccount = bank.account;
      bank.bankAccount = bank.account;
      bank.bankFront = bank.front;
      bank.bankBack = bank.back;
    }

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>银行卡</div>
          </div>
        )}
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <CustomerDetailBankInfoForm
              formUtils={this.formUtils}
              data={bank}
            />
          ) : (
            <Form>
              <FormItem label="银行卡帐号" {...formItemLayout}>
                {bank && bank.bankAccount}
              </FormItem>
              <FormItem label="开户行" {...formItemLayout}>
                {bank && bank.bankName}
              </FormItem>
              <FormItem label="银行卡正反面" {...formItemLayout}>
                <ul className={style.images}>
                  {bank && bank.bankFront ? (
                    <li className={style.image}>
                      <img src={bank && bank.bankFront} alt="银行卡正面" />
                    </li>
                  ) : null}

                  {bank && bank.bankBack ? (
                    <li className={style.image}>
                      <img src={bank && bank.bankBack} alt="银行卡反面" />
                    </li>
                  ) : null}
                </ul>
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
