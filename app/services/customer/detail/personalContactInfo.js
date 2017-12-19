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
import Category from "model/Product/category";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

import moment from "moment";

import EditCustomerTagModal from "../editCustomerTagModal";

const NAME = "CustomerContactInfoForm";

class CustomerDetailContactInfoForm extends Base {
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
    values.birthday = values.birthday ? moment(values.birthday) : null;
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
      <div id={NAME}>
        <Form>
          <FormItem label="手机号码" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("mobile", {
              initialValue: data.mobile,
              rules: [
                {
                  min: 6,
                  max: 20,
                  message: "长度为6-20"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="微信" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("wechat", {
              initialValue: data.wechat,
              rules: [
                {
                  min: 6,
                  max: 20,
                  message: "长度为6-20"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="QQ" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("qq", {
              initialValue: data.qq,
              rules: [
                {
                  min: 6,
                  max: 20,
                  message: "长度为6-20"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem label="邮箱" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("email", {
              initialValue: data.email,
              rules: [
                {
                  min: 6,
                  max: 20,
                  message: "长度为6-20"
                }
              ]
            })(<Input />)}
          </FormItem>
        </Form>
      </div>
    );
  }
}

CustomerDetailContactInfoForm = Form.create()(CustomerDetailContactInfoForm);

export default class CustomerDetailContactInfo extends Component {
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
      console.log(errors);
      if (!errors) {
        values = this.formUtils.getFieldsValue();

        values = this.formatData(values);
        console.log(values);
        values.id = data.id;
        this.customer.update_contact(values).then(res => {
          if (res && res.success) {
            message.success("更新联系资料成功");
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
  genneratorFix = children => {
    const { mod } = this.props;
    return mod.state.visible ? (
      <Affix target={() => mod.affixContainer}>{children}</Affix>
    ) : (
      children
    );
  };
  render() {
    let { data } = this.props;
    if (!data) {
      return null;
    }

    data = JSON.parse(JSON.stringify(data));

    const canEdit = data.contact.permission.editPermission;
    const canRead = data.contact.permission.readPermission;
    const contact = data.contact.data;
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>联系信息</div>
          </div>
        )}
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <CustomerDetailContactInfoForm
              formUtils={this.formUtils}
              data={contact}
            />
          ) : (
            <Form>
              <FormItem label="手机号码" {...formItemLayout}>
                {contact.mobile}
              </FormItem>
              <FormItem label="微信" {...formItemLayout}>
                {contact.wechat}
              </FormItem>
              <FormItem label="座机号码" {...formItemLayout}>
                {contact.qq}
              </FormItem>
              <FormItem label="QQ" {...formItemLayout}>
                {contact.qq}
              </FormItem>
              <FormItem label="邮箱" {...formItemLayout}>
                {contact.email}
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
