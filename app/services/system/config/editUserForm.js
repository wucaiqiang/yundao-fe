import React, { Component } from "react";
import {
  Select,
  Cascader,
  Input,
  DatePicker,
  Tag,
  Checkbox,
  Button,
  Table,
  Modal,
  Form,
  Menu,
  Pagination,
  Spin,
  message,
  Icon,
  Tabs,
  TreeSelect
} from "antd";

import FormUtils from "../../../lib/formUtils";
import utils from "../../../utils/";

import Role from "../../../model/Role/";
import User from "../../../model/User/";

import Base from "../../../components/main/Base";
import ViewInput from "../../../components/Form/Input";
import Radio from "../../../components/Form/Radio";

import SearchSelect from "components/Form/SearchSelect";

const SubMenu = Menu.SubMenu;
const Option = Select.Option;

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import style from "./editUserForm.scss";

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const TreeNode = TreeSelect.TreeNode;

let timeout;
let currentValue;

class EditUserForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      roles: [],
      data: this.props.data,
      leaderNameList: [],
      passwordType: "password"
    };
    this.formUtils = new FormUtils("editUserForm");
    this.role = new Role();
  }

  componentWillMount() {
    this.user = new User();
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  componentDidMount() {
    this.loadRole();
  }

  loadRole = () => {
    this.role.gets().then(res => {
      if (res.success) {
        this.setState({ roles: res.result });
      }
    });
  };

  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }

    if (this.props.isEdit === false) {
      cls.push(style.viewForm);
    }
    return cls.join(" ");
  }

  transformDepartmentTree = (items, dist, disabled) => {
    if (!items) {
      return;
    }
    //如果父节点被禁止使用 所有子节点被禁止点击 否则 判断当前节点是否等于传入进来的默认节点 假如是的话 则当前节点禁止点击 并且子节点禁止点击
    let childrenDisabled = false;
    if (disabled == true) {
      childrenDisabled = true;
    }
    return (
      items.length &&
      items.map((item, index) => {
        if (item.childs && item.childs.length) {
          let disabled = true;
          if (!childrenDisabled) {
            disabled = dist == item.id ? true : false;
          }
          return (
            <TreeNode
              disabled={disabled}
              value={item.id.toString()}
              title={item.name}
              key={item.id.toString()}
            >
              {this.transformDepartmentTree(item.childs, dist, disabled)}
            </TreeNode>
          );
        } else {
          let disabled = true;
          if (!childrenDisabled) {
            disabled = dist == item.id ? true : false;
          }
          return (
            <TreeNode
              disabled={disabled}
              value={item.id.toString()}
              title={item.name}
              key={item.id.toString()}
            />
          );
        }
      })
    );
  };
  getMobileHTML = () => {
    let decorator, field, fieldTextStyle, fieldInputStyle;
    if (this.props.data.id) {
      return (
        <FormItem label="手机号码" {...this.formItemLayout}>
          <span style={fieldTextStyle}>{this.props.data.mobile}</span>
        </FormItem>
      );
    }

    decorator = this.props.formUtils.getFieldDecorator("mobile", {
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
            } else if (value.length < 6) {
              callback("长度只能在6-20位数字之间，请重新输入");
            } else if (value.length > 20) {
              callback("长度只能在6-20位数字之间，请重新输入");
            } else {
              this.user.check_mobile(value).then(r => {
                if (r && r.success) {
                  if (r.result.commonExist) {
                    //存在系统中
                    if (r.result.tenantExist) {
                      //存在租户中   提示手机号码已经存在
                      this.setState({ needPassword: false });
                      callback("手机号码已经存在");
                      return false;
                    }
                    //存在系统中不需要密码
                    this.setState({ needPassword: false });
                    callback();
                    return false;
                  } else {
                    //不存在系统中 需要设置初始化密码
                    this.setState({ needPassword: true });
                    callback();
                  }
                }
              });
            }
          }
        }
      ],
      validateTrigger: "onBlur"
    });
    return (
      <FormItem label="手机号码" {...this.formItemLayout}>
        {decorator(<Input type="text" autoComplete="new-password" />)}
      </FormItem>
    );
  };

  getJobNumberHTML = () => {
    const {isEdit} = this.props
    let decorator, field, fieldTextStyle, fieldInputStyle;

    decorator = this.props.formUtils.getFieldDecorator("jobNumber", {
      initialValue: this.props.data.jobNumber,
      rules: [
        {
          validator: (rules, value, callback) => {
            if (!value || value == this.props.data.jobNumber) {
              callback();
              return false;
            }
            value = value.replace(/(^\s*)|(\s*)$/g, "");
            if (!value) {
              callback();
            } else if (value.length >= 20) {
              callback("请填写长度不超过20个字符的工号");
            } else {
              this.user.check_job_number(value).then(r => {
                if (r.result) {
                  callback("工号已经存在");
                } else {
                  callback();
                }
              });
            }
          }
        }
      ],
      validateTrigger: "onBlur"
    });
    if (this.props.record) {
      field = this.props.record.jobNumber;
      fieldTextStyle = {
        display: "block"
      };
      fieldInputStyle = {
        display: "none"
      };
    } else {
      field = "";
      fieldTextStyle = {
        display: "none"
      };
      fieldInputStyle = {
        display: "block"
      };
    }
    return (
      <FormItem label="工号" {...this.formItemLayout}>
        <span style={fieldTextStyle}>{field}</span>
        {!isEdit?null:decorator(
          <ViewInput
            isEdit={this.props.isEdit}
            type="text"
            style={fieldInputStyle}
          />
        )}
      </FormItem>
    );
  };

  render() {
    let formUtils;
    formUtils = this.formUtils;

    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };

    this.formItemLayout = formItemLayout;

    const { data,isEdit } = this.props;

    const tProps = {
      showCheckedStrategy: SHOW_PARENT,
      treeDefaultExpandAll: true,
      searchPlaceholder: "请选择所属部门"
    };
    const roleList = this.state.roles.map(role => {
      return <Option key={role.id}>{role.name}</Option>;
    });
    const department = utils.getStorage("department");
    let departmentTree = null;

    if (department && department.length) {
      departmentTree = this.transformDepartmentTree(department, 0);
    }

    //遍历获取已经有的roleids
    const roleIds = [];
    data.roles && data.roles.map(role => roleIds.push(role.roleId.toString()));
    return (
      <div className={style.body} id='edit_user_form' style={{
        position:'relative'
      }}>
        <Form className={this.getFormClassName()}>
          <FormItem label="员工姓名" {...formItemLayout}>
            {!isEdit?data.realName:this.props.formUtils.getFieldDecorator("realName", {
              initialValue: data.realName,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "输入长度不超过20个字符",
                  min: 1,
                  max: 20
                }
              ]
            })(
              <Input
                type="text"
                placeholder="请输入员工姓名"
              />
            )}
          </FormItem>
          <FormItem label="所属部门" {...formItemLayout}>
            {!this.props.isEdit ? (
              data.departmentName
            ) : (
              this.props.formUtils.getFieldDecorator("departmentId", {
                initialValue:
                  data.departmentId ? data.departmentId.toString()
                    : null,
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  {
                    required: data.isSystem === 1 ? false : true,
                    message: "请选择所属部门"
                  }
                ]
              })(
                <TreeSelect
                getPopupContainer={()=>document.getElementById('edit_user_form')}
                  {...tProps}
                >
                  {departmentTree}
                </TreeSelect>
              )
            )}
          </FormItem>
          <FormItem label="角色" {...formItemLayout}>
            {!this.props.isEdit ? (
              data.roleNames && data.roleNames.join(",")
            ) : (
              this.props.formUtils.getFieldDecorator("roleIds", {
                initialValue: roleIds,
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  {
                    required: true,
                    message: "请选择最少一个角色"
                  }
                ]
              })(
                <Select
                getPopupContainer={()=>document.getElementById('edit_user_form')}
                  showSearch
                  disabled={data.isSystem === 1 ? true : false}
                  mode="multiple"
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0}
                  style={{
                    width: "100%"
                  }}
                >
                  {roleList}
                </Select>
              )
            )}
          </FormItem>
          {this.getMobileHTML()}
          {data.id ? (
            <FormItem label="初始登录密码" {...formItemLayout}>
              ********
            </FormItem>
          ) : null}
          {this.state.needPassword && !data.id ? (
            <FormItem label="初始登录密码" {...formItemLayout}>
              {this.props.formUtils.getFieldDecorator("password", {
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  { required: true, message: "请输入密码" },
                  {
                    message: "6-20位，不能是纯字母或纯数字",
                    pattern: new RegExp(
                      "^(?![d]+$)(?![a-zA-Z]+$)(?![^da-zA-Z]+$).{6,20}$"
                    )
                  }
                ]
              })(
                <Input
                  placeholder="请输入密码"
                  autoComplete="new-password"
                  type={this.state.passwordType}
                  suffix={
                    <Icon
                      type={
                        this.state.passwordType == "password" ? "eye-o" : "eye"
                      }
                      onClick={() => {
                        this.setState({
                          passwordType:
                            this.state.passwordType == "text"
                              ? "password"
                              : "text"
                        });
                      }}
                    />
                  }
                />
              )}
            </FormItem>
          ) : null}
          {!this.props.isEdit ? (
            <FormItem label="汇报上级" {...formItemLayout}>
              {data.leaderName}
            </FormItem>
          ) : (
            <div id="leaderId_FormItem">
              <FormItem label="汇报上级" {...formItemLayout}>
                <SearchSelect
                  label="汇报上级"
                  request={this.user.get_users_by_realName}
                  format={r => {
                    return { value: r.id, label: `${r.realName}(${r.mobile})` };
                  }}
                  formUtils={this.props.formUtils}
                  name="leaderId"
                  initData={{
                    label: data.leaderName,
                    value: data.leaderId
                  }}
                />
                {this.props.formUtils.getFieldDecorator("leaderId")(
                  <Input type="hidden" />
                )}
              </FormItem>
            </div>
          )}
          {this.getJobNumberHTML()}
        </Form>
      </div>
    );
  }
}
EditUserForm = Form.create()(EditUserForm);

export default EditUserForm;
