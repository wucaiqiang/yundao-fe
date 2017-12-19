import React, { Component } from "react";
import {
  Breadcrumb,
  Table,
  Icon,
  Form,
  Input,
  Button,
  Menu,
  Tree,
  Spin,
  Tabs,
  Modal,
  Select,
  message
} from "antd";

const { Option } = Select;

import FormUtils from "../../../lib/formUtils";
// import User from "../../../model/User/"; const icon_export =
// "/assets/images/icon/导出@2x.png"; const icon_add =
// "/assets/images/icon/新增@2x.png";

import GM from "../../../lib/gridManager.js";
const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const GridSortFilter = GM.GridSortFilter;
const FilterBar = GM.FilterBar;

import style from "./roleData.scss";

import Resource from "../../../model/Resource/";

import Base from "../../../components/main/Base";

import GridBase from "../../../base/gridMod";
class RoleData extends Base {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      roleId: this.props.role.id,
      defaultExpandedRowKeys: [3, 5]
    };
    this.formUtils = new FormUtils("RoleData");
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }

  componentDidMount() {
    const roleId = this.props.role.id;
    this.loadData(roleId);
  }

  componentWillReceiveProps(nextProps) {
    const roleId = this.props.role.id;
    if (nextProps.role.id !== roleId) {
      this.setState({ roleId: nextProps.role.id });
      this.loadData(nextProps.role.id);
    }
  }

  loadData=(id)=> {
    this.resource = new Resource();
    this.setState({ loading: true });
    this.resource.get_role_data_auth(id).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        this.formUtils && this.formUtils.resetFields();
        this.setState({ data: res.result });
      }
    });
  }

  handleSave() {
    // const i = this.state.data.map(item=>item.id)
    this.formUtils.validateFields(errors => {
      if (!errors) {
        //判断下拉选项卡
        const values = this.formUtils.getFieldsValue();
        values.selections = [];
        this.state.data.map((item, index) => {
          const readValue = values[`selections-${item.id}-read`];
          const updateValue = values[`selections-${item.id}-update`];
          const deleteValue = values[`selections-${item.id}-delete`];
          let data = {
            id: item.id,
            code: item.code
          };
          if (readValue) {
            data.read = Number(readValue);
          }
          if (updateValue) {
            data.update = Number(updateValue);
          }
          if (deleteValue) {
            data.delete = Number(deleteValue);
          }
          values.selections.push(data);
          delete values[`selections-${item.id}-read`];
          delete values[`selections-${item.id}-update`];
          delete values[`selections-${item.id}-delete`];
        });
        values.selections = JSON.stringify(values.selections);
        values.roleId = this.props.role.id;
        this.resource.update_role_data_auth(values).then(res => {
          if (res.success) {
            message.success("角色数据权限更新保存成功");
          }
        });
      }
    });
  }

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <RoleDataForm
          role={this.props.role}
          formUtils={this.formUtils}
          data={this.state.data}
        />
      </Spin>
    );
  }
}

class RoleDataForm extends GridBase {
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  state = {
    defaultExpandedRowKeys: [3, 5]
  };
  getColumns() {
    const columns = [
      {
        title: "数据类型",
        dataIndex: "name",
        width: 160,
        fixed:'left',
        render: (text, record) => {
          return text || "--";
        }
      },
      {
        title: "查看",
        dataIndex: "read",
        render: (text, record) => {
          return record.read &&
          record.read.childs &&
          record.read.childs.length ? record.read.childs.length == 1 &&
          record.read.childs[0].value == "40" &&
          record.read.initValue == 40 ? (
            <div>
              全部
              {this.formUtils.getFieldDecorator(
                `selections-${record.id}-read`,
                {
                  initialValue: record.read.initValue.toString()
                }
              )(<Input type="hidden" />)}
            </div>
          ) : (
            this.formUtils.getFieldDecorator(`selections-${record.id}-read`, {
              initialValue: record.read.initValue.toString(),
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  whitespace: true,
                  min: 1,
                  max: 100,
                  message: "请填写一个长度不超过100个字符的选项，和删除空白选项"
                }
              ]
            })(
              <Select
               onChange={value=>{
                 const updateValue = this.formUtils.getFieldValue(`selections-${record.id}-update`);
                 const deleteValue = this.formUtils.getFieldValue(`selections-${record.id}-delete`);
                 let msg =null
                 if(updateValue && updateValue>value){
                   const data = {}
                   data[`selections-${record.id}-update`] = value
                   this.formUtils.setFieldsValue(data)
                    msg=`${record.name}的编辑权限同步下调到“${record.read.childs.filter(item=>item.value==value)[0].label}”`
                 }
                 if(deleteValue && deleteValue>value){
                  const data = {}
                  data[`selections-${record.id}-delete`] = value
                  this.formUtils.setFieldsValue(data)
                  msg=`${record.name}的编辑和删除权限同步下调到“${record.read.childs.filter(item=>item.value==value)[0].label}”`
                 }
                 msg && message.success(msg)
               }}
                // disabled={this.props.role.isSystem ? true : false}
                style={{
                  width: 120
                }}
              >
                {record.read.childs.map(item => {
                  return (
                    <Option key={item.value} value={item.value.toString()}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )
          ) : (
            "--"
          );
        }
      },
      {
        title: "编辑",
        dataIndex: "update",
        render: (text, record) => {
          return record.update &&
          record.update.childs &&
          record.update.childs.length ? record.update.childs.length == 1 &&
          record.update.childs[0].value == "40" &&
          record.update.initValue == 40 ? (
            <div>
              全部
              {this.formUtils.getFieldDecorator(
                `selections-${record.id}-update`,
                {
                  initialValue: record.update.initValue.toString()
                }
              )(<Input type="hidden" />)}
            </div>
          ) : (
            this.formUtils.getFieldDecorator(`selections-${record.id}-update`, {
              initialValue: record.update.initValue.toString(),
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  whitespace: true,
                  min: 1,
                  max: 100,
                  message: "请填写一个长度不超过100个字符的选项，和删除空白选项"
                }
              ]
            })(
              <Select
              onChange={value=>{
                 const readValue = this.formUtils.getFieldValue(`selections-${record.id}-read`);
                 const deleteValue = this.formUtils.getFieldValue(`selections-${record.id}-delete`);
                 let msg =null
                 if(readValue && readValue<value ){
                  //  if (record.update.childs.length == 1 &&
                  //   record.update.childs[0].value == "40" &&
                  //   record.update.initValue == 40 ){
                  //     return false;
                  //   }
                   const data = {}
                   data[`selections-${record.id}-read`] = value
                   this.formUtils.setFieldsValue(data)
                    msg=`${record.name}的查看权限同步上调到“${record.update.childs.filter(item=>item.value==value)[0].label}”`
                    message.success(msg)
                 }
                 if(deleteValue && deleteValue>value){
                  const data = {}
                  data[`selections-${record.id}-delete`] = value
                  this.formUtils.setFieldsValue(data)
                  msg=`${record.name}的删除权限同步下调到“${record.update.childs.filter(item=>item.value==value)[0].label}”`
                  message.success(msg)
                 }
                //  msg && message.success(msg)
               }}
                // disabled={this.props.role.isSystem ? true : false}
                style={{
                  width: 120
                }}
              >
                {record.update.childs.map(item => {
                  return (
                    <Option key={item.value} value={item.value.toString()}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )
          ) : (
            "--"
          );
        }
      },
      {
        title: "删除",
        dataIndex: "delete",
        render: (text, record) => {
          return record.delete &&
          record.delete.childs &&
          record.delete.childs.length ? record.delete.childs.length == 1 &&
          record.delete.childs[0].value == "40" &&
          record.delete.initValue == 40 ? (
            <div>
              全部
              {this.formUtils.getFieldDecorator(
                `selections-${record.id}-delete`,
                {
                  initialValue: record.delete.initValue.toString()
                }
              )(<Input type="hidden" />)}
            </div>
          ) : (
            this.formUtils.getFieldDecorator(`selections-${record.id}-delete`, {
              initialValue: record.delete.initValue.toString(),
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  whitespace: true,
                  min: 1,
                  max: 100,
                  message: "请填写一个长度不超过100个字符的选项，和删除空白选项"
                }
              ]
            })(
              <Select
              onChange={value=>{
                 const updateValue = this.formUtils.getFieldValue(`selections-${record.id}-update`);
                 const readValue = this.formUtils.getFieldValue(`selections-${record.id}-read`);
                 let msg =null

                 if(readValue && readValue<value){
                  const data = {}
                  data[`selections-${record.id}-read`] = value
                  this.formUtils.setFieldsValue(data)
                  msg=`${record.name}的查看权限同步上调到“${record.delete.childs.filter(item=>item.value==value)[0].label}”`
                 }
                 if(updateValue && updateValue<value){
                  const data = {}
                  data[`selections-${record.id}-update`] = value
                  this.formUtils.setFieldsValue(data)
                   msg=`${record.name}的查看和编辑权限同步上调到“${record.delete.childs.filter(item=>item.value==value)[0].label}”`
                }
                 msg && message.success(msg)
               }}
                // disabled={this.props.role.isSystem ? true : false}
                style={{
                  width: 120
                }}
              >
                {record.delete.childs.map(item => {
                  return (
                    <Option key={item.value} value={item.value.toString()}>
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )
          ) : (
            "--"
          );
        }
      }
    ];

    return columns;
  }
  render() {
    console.log('this.props.data',this.props.data)
    return (
      <div className={style.body}>
        <GridManager
          noRowSelection={true}
          disabledAutoLoad={true}
          columns={this.getColumns()}
          dataSource={this.props.data}
          gridWrapClassName="grid-panel auto-width-grid"
          mod={this}
          rowKey={"id"}
          defaultExpandedRowKeys={this.state.defaultExpandedRowKeys}
          expandedRowRender={record => {
            return <p>{record.description}</p>;
          }}
          pagination={false}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        />
      </div>
    );
  }
}

RoleDataForm = Form.create()(RoleDataForm);

export default RoleData;
