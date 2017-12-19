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
import Category from "model/Product/category";

import FormUtils from "lib/formUtils";

import extend from "extend";

import moment from "moment";

import Base from "components/main/Base";

const NAME = "CustomerInvestInfoForm";

class CustomerDetailInvestInfoForm extends Base {
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
    const dictionary = new Dictionary();
    dictionary
      .gets("dic_customer_invest_type,dic_customer_risk_rating")
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
    // values.birthday = values.birthday     ? moment(values.birthday)     : null
    return values;
  };
  render() {
    let { data } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    console.log("data", data);

    // data.investTypes = data.investTypes && data.investTypes.length     ? data
    //     .investTypes         .map(item => item.productTypeId.toString())     : []

    data.riskRating = data.riskRating ? data.riskRating.toString() : null;
    data.type = data.type ? data.type.toString() : null;

    return (
      <div id={NAME}>
        <Form>
          <FormItem label="投资偏好" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("investTypes", {
              initialValue: data.investTypes
            })(
              <Select
                size="large"
                mode={"multiple"}
                placeholder="请选择"
                allowClear={true}
                getPopupContainer={() => document.getElementById(NAME)}
              >
                {this.state.category.map(item => {
                  return (
                    <Option value={item.value.toString()} key={item.value}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label="投资人类型" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("type", {
              initialValue: data.type,
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (value == 2) {
                      if (!data.attachDtos || !data.attachDtos.length) {
                        callback(
                          "请为客户上传资产证明，并确认客户符合专业投资人标准后再选择该选项"
                        );
                      }
                    }
                    callback();
                  }
                }
              ]
            })(
              <Select
                size="large"
                placeholder="请选择"
                allowClear={true}
                getPopupContainer={() => document.getElementById(NAME)}
              >
                {this.getDicSelections(Option, "dic_customer_invest_type")}
              </Select>
            )}
          </FormItem>
          <FormItem label="风险特征" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("riskRating", {
              initialValue: data.riskRating
            })(
              <Select
                size="large"
                allowClear={true}
                placeholder="请选择"
                getPopupContainer={() => document.getElementById(NAME)}
              >
                {this.getDicSelections(Option, "dic_customer_risk_rating")}
              </Select>
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

CustomerDetailInvestInfoForm = Form.create()(CustomerDetailInvestInfoForm);

export default class CustomerDetailInvestInfo extends Component {
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
      console.log(errors);
      if (!errors) {
        values = this.formUtils.getFieldsValue();

        values = this.formatData(values);
        values.id = data.id;
        values.investTypes = values.investTypes.join(",");
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
            return {
              url: item.url,
              name: item.name
            };
          })
        );
        info.tags = tags;

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
            message.success("更新投资资料成功");
            // mod.reloading()
            mod.loadData();
            mod.refreshGrid && mod.refreshGrid();
            this.setState({
              isEdit: false
            });
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
    const info = JSON.parse(JSON.stringify(data.info.data));
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const typeTexts = info.investTypes
      .map(item => item.productTypeIdText)
      .join(",");
    info.investTypes =
      info.investTypes && info.investTypes.length
        ? info.investTypes.map(item => item.productTypeId.toString())
        : [];

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>投资资料</div>
          </div>
        )}
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <CustomerDetailInvestInfoForm
              data={info}
              formUtils={this.formUtils}
            />
          ) : (
            <Form>
              <FormItem label="投资偏好" {...formItemLayout}>
                {typeTexts}
              </FormItem>
              <FormItem label="投资人类型" {...formItemLayout}>
                {info.typeText}
              </FormItem>
              <FormItem label="风险特征" {...formItemLayout}>
                {info.riskRatingText}
              </FormItem>
              <FormItem label="证件类型" {...formItemLayout}>
                {info.credential && info.credential.typeText}
              </FormItem>
              <FormItem label="证件号码" {...formItemLayout}>
                {info.certNo}
              </FormItem>
              <FormItem label="证件正反面" {...formItemLayout}>
                <ul className={style.images}>
                  {!info.certFront ? null : (
                    <li className={style.image}>
                      <a href={info.certFront} target="_blank">
                        <img src={info.certFront} alt="证件正面" />
                      </a>
                    </li>
                  )}
                  {!info.certBack ? null : (
                    <li className={style.image}>
                      <a href={info.certBack} target="_blank">
                        <img src={info.certBack} alt="证件反面" />
                      </a>
                    </li>
                  )}
                </ul>
              </FormItem>
              <FormItem label="证件有效期" {...formItemLayout} />
              <FormItem label="资产证明" {...formItemLayout}>
                <ul className={style.images}>
                  {info.attachDtos.map(item => {
                    return (
                      <li className={style.image}>
                        <a href={item.url} target="_blank">
                          <img src={item.url} alt="" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
