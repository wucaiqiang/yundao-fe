import React, { Component } from "react";
import { Input, Form, message, Icon, Popover } from "antd";

import FormUtils from "../../../lib/formUtils";

import Role from "../../../model/Role/";

import Base from "../../../components/main/Base";
import ViewInput from "../../../components/Form/Input";
import Radio from "../../../components/Form/Radio";
import TreeSelect from "../../../components/Form/TreeSelect";

import style from "./editElementsForm.scss";

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

class EditElementsForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      products: [],
      productCount: 0,
      selectedCustomers: [],
      roles: [],
      currentTab: "0",
      money: 0,
      isCreateByCustomer: false,
      investmentType: "1",
      value: ["0-0-0"]
    };
    this.formUtils = new FormUtils("editElementsForm");
    this.role = new Role();
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  componentDidMount() {
    this.role.gets().then(res => {
      if (res.success) {
        this.setState({ roles: res.result });
      }
    });
  }

  handleTab = e => {
    console.log("click ", e);
    this.setState({ currentTab: e.key });
  };

  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }

  remove = i => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter((key, index) => {
        return index !== i;
      })
    });
  };

  add = () => {
    //最多 100 个
    const max = 100;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    if (keys.length > max) {
      return false;
    }
    const nextKeys = keys.concat({ id: null, label: null });
    // can use data-binding to set important! notify form to detect changes
    form.setFieldsValue({ keys: nextKeys });
  };

  render() {
    let formUtils = this.formUtils;

    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 19
      }
    };

    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 20,
          offset: 4
        }
      }
    };

    const { data, isEdit } = this.props;

    const isSystemAndShare = data.isSystem == 1 && data.isShare == 1;

    let formItems = null;
    //初始化多选项
    if (["checkbox", "select", "radio"].indexOf(this.props.formType) > -1) {
      let initSelections = [
        {
          id: null,
          label: null
        }
      ];
      if (data.selections) {
        initSelections = data.selections;
      }
      this.props.form.getFieldDecorator("keys", {
        initialValue: initSelections
      });

      const keys = this.props.form.getFieldValue("keys");

      formItems = keys.map((k, index) => {
        return (
          <div className={style.inner_form_item}>
            {this.props.form.getFieldDecorator(`selections-${index}-id`, {
              initialValue: k.id || null
            })(<Input type="hidden" />)}
            <FormItem required={true} key={index}>
              {this.props.form.getFieldDecorator(`selections-${index}-label`, {
                initialValue: k.label || null,
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    min: 1,
                    max: 100,
                    message:
                      "请填写一个长度不超过100个字符的选项，和删除空白选项"
                  }
                ]
              })(
                <Input
                  placeholder="选项信息"
                  type="text"
                  disabled={k.id ? k.isSystem : false}
                  suffix={
                    k.isSystem && k.id ? null : (
                      <Icon
                        className={style.dynamic_delete_button}
                        type="close"
                        onClick={() => this.remove(index)}
                      />
                    )
                  }
                />
              )}
            </FormItem>
          </div>
        );
      });
    }

    return (
      <div className={style.body}>
        <Form className={this.getFormClassName()}>
          <FormItem label="要素类型" {...formItemLayout}>
            {this.props.eleText}
          </FormItem>
          <FormItem required={isEdit} label="要素名称" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("name", {
              initialValue: data.name,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过50个字符的要素名称",
                  min: 1,
                  max: 50
                }
              ]
            })(
              isSystemAndShare ? (
                <Popover
                  placement="topRight"
                  content={"系统预置，不可修改"}
                  arrowPointAtCenter
                >
                  <ViewInput
                    isEdit={isEdit}
                    disabled={isSystemAndShare}
                    type="text"
                  />
                </Popover>
              ) : (
                <ViewInput
                  isEdit={isEdit}
                  disabled={isSystemAndShare}
                  type="text"
                />
              )
            )}
          </FormItem>
          <FormItem required={isEdit} label="是否必填" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("isMandatory", {
              initialValue: 0
            })(
              <RadioGroup isEdit={isEdit}>
                <Radio
                  isEdit={isEdit}
                  value={1}
                  disabled={data.canEditMandatory == 0 ? true : false}
                  className="radio-label"
                >
                  必填
                </Radio>
                <Radio
                  isEdit={isEdit}
                  value={0}
                  disabled={data.canEditMandatory == 0 ? true : false}
                  className="radio-label"
                >
                  可空
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem required={isEdit} label="是否通用" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("isShare", {
              initialValue: 0
            })(
              <RadioGroup isEdit={isEdit}>
                <Radio
                  isEdit={isEdit}
                  value={1}
                  disabled={isSystemAndShare}
                  className="radio-label"
                >
                  通用
                </Radio>
                <Radio
                  isEdit={isEdit}
                  value={0}
                  disabled={isSystemAndShare}
                  className="radio-label"
                >
                  非通用
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem required={isEdit} label="是否启用" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("isEnabled", {
              initialValue: 0
            })(
              <RadioGroup isEdit={isEdit}>
                <Radio
                  value={1}
                  isEdit={isEdit}
                  disabled={data.canEditEnabled == 0 ? true : false}
                  className="radio-label"
                >
                  启用
                </Radio>
                <Radio
                  value={0}
                  isEdit={isEdit}
                  disabled={data.canEditEnabled == 0 ? true : false}
                  className="radio-label"
                >
                  关闭
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
          {["number", "number_range"].indexOf(this.props.formType) > -1 ? (
            <FormItem
              required={
                isEdit && this.props.formUtils.getFieldValue("isMandatory") == 1
                  ? true
                  : false
              }
              label="单位"
              {...formItemLayout}
            >
              {this.props.formUtils.getFieldDecorator("unit", {
                rules: [
                  {
                    required:
                      this.props.formUtils.getFieldValue("isMandatory") == 1
                        ? true
                        : false,
                    type: "string",
                    whitespace: true,
                    message: "请填写长度不超过20个字符的单位",
                    min: 1,
                    max: 20
                  }
                ]
              })(
                <ViewInput
                  isEdit={isEdit}
                  disabled={isSystemAndShare}
                  type="text"
                />
              )}
            </FormItem>
          ) : null}
          {["checkbox", "select", "radio"].indexOf(this.props.formType) > -1 ? (
            <FormItem required={isEdit} label="选项信息" {...formItemLayout}>
              {isEdit ? (
                <div className={style.multiple_selection}>
                  <FormItem
                    style={{
                      textAlign: "right"
                    }}
                  >
                    <div className={style.pointer_add} onClick={this.add}>
                      <Input type="hidden" suffix={<Icon type="plus" />} />
                    </div>
                  </FormItem>
                  <div className={style.inner_form_list}>{formItems}</div>
                </div>
              ) : (
                data.selections &&
                data.selections.map(item => item.label).join(",")
              )}
            </FormItem>
          ) : null}
        </Form>
      </div>
    );
  }
}
EditElementsForm = Form.create()(EditElementsForm);

export default EditElementsForm;
