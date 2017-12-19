import React, { Component } from "react";
import { Button, Modal, Form, Menu, Icon, Spin } from "antd";

import Base from "../../../components/main/Base";
import FormUtils from "../../../lib/formUtils";
import EditElementsForm from "./editElementsForm";
import Elements from "../../../model/Product/elements";
import style from "./editElementsModal.scss";

const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;

const elementsTypeList = {
  text: "文本",
  textarea: "文本域",
  image: "图片",
  date: "日期",
  date_range: "日期区间",
  select: "下拉选项",
  radio: "单选",
  checkbox: "多选",
  number: "数值",
  number_range: "数值区间",
  address: "地址"
};

class EditElementsModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      currentTab: "text",
      eleText: "文本",
      formData: {}
    };
    this.formUtils = new FormUtils("editElementsModal");
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show(data) {
    console.log("editUserModal show data:", data);
    const elements = new Elements();
    this.setState({ visible: true });

    if (data && data.id) {
      this.setState({ formData: data, loading: true, isEdit: false });
      elements.get(data.id).then(res => {
        if (res.success) {
          const data = res.result;
          this.setState({ formData: data, loading: false });
          for (var key in elementsTypeList) {
            if (elementsTypeList.hasOwnProperty(key)) {
              if (key == data.fieldTypeCode) {
                this.setState({
                  currentTab: key,
                  eleText: elementsTypeList[key]
                });
                break;
              }
            }
          }
          if (this.form) {
            this.formUtils.resetFields();
            this.formUtils.setFieldsValue(res.result);
          }
        }
      });
    } else {
      this.setState({ formData: {}, isEdit: true });
      this.formUtils.resetFields();
    }
  }
  handleTab = e => {
    this.setState({ currentTab: e.key, eleText: e.item.props.tab });
  };
  handleSubmit = e => {
    const elements = new Elements();
    this.formUtils.validateFields((errors, values) => {
      console.log(errors);
      console.log(values);
      if (!errors) {
        const { currentTab, formData } = this.state;
        const values = this.formUtils.getFieldsValue();

        let request = null;

        if (formData.id) {
          values.id = formData.id;
          request = elements.edit;
          //编辑
        } else {
          //新增 根据tab 匹配 要素code 类型
          values.fieldTypeCode = currentTab;
          request = elements.add;
        }

        if (["select", "radio", "checkbox"].indexOf(currentTab) > -1) {
          //判断下拉选项卡
          values.selections = [];
          values.keys.map((key, index) => {
            values.selections.push({
              id: values[`selections-${index}-id`],
              label: values[`selections-${index}-label`]
            });
            delete values[`selections-${index}-id`];
            delete values[`selections-${index}-label`];
          });
          values.selections = JSON.stringify(values.selections);
          delete values.keys;
        }

        console.log("modal values:", values);

        values.access = 0;
        delete values.roleIds;

        //提交表单
        const submitform = () => {
          request(values).then(res => {
            if (res.success) {
              this.setState({ visible: false });
              this.props.submit(values);
            }
          });
        };

        //请求前对于 编辑可能影响的产品类型 进行提示
        if (
          formData.id &&
          formData.fieldGroups &&
          formData.fieldGroups.length
        ) {
          const fieldGrops = formData.fieldGroups
            .map(field => field.name)
            .join(",");

          confirm({
            title: "编辑将影响以下几种产品类型",
            iconType: "exclamation",
            content: (
              <div>
                {fieldGrops}
                <br />
              </div>
            ),
            onOk: () => {
              // 提交表单
              submitform();
            },
            okText: "确定",
            cancelText: "取消"
          });
        } else {
          //直接提交表单
          submitform();
        }
      }
    });
  };

  render() {
    let formUtils;

    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };
    formUtils = this.props.formUtils || this.formUtils;
    this.formUtils = formUtils;

    const {
      visible,
      formData,
      loading,
      isEdit,
      currentTab,
      eleText
    } = this.state;

    return (
      <Modal
        visible={visible}
        title={
          <div>
            {(formData.id ? (isEdit ? "编辑" : "查看") : "新增") + "基金产品要素"}
            {isEdit || loading ? null : (
              <Icon
                className={"fr"}
                type="edit"
                onClick={() => {
                  this.setState({
                    isEdit: true
                  });
                }}
              />
            )}
          </div>
        }
        maskClosable={false}
        closable={false}
        width={formData.id ? 520 : 680}
        className={`vant-modal edit_elements_modal ${style.edit_elements_modal} yundao-modal`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleCancel}
        footer={[
          isEdit && formData.id ? (
            <Button
              key="cancel"
              onClick={() => {
                this.formUtils.setFieldsValue(formData);
                this.setState({
                  isEdit: false
                });
              }}
            >
              取消
            </Button>
          ) : (
            <Button key="close" onClick={this.handleCancel}>
              关闭
            </Button>
          ),
          loading ? null : !isEdit ? null : (
            <Button key="save" type="primary" onClick={this.handleSubmit}>
              保存
            </Button>
          )
        ]}
      >
        <Spin spinning={loading}>
          <div className={style.body}>
            {!formData.id ? (
              <div className={style.tabbar}>
                <div className={style.title}>选择要素类型</div>
                <Menu
                  style={{
                    width: 160
                  }}
                  onClick={this.handleTab}
                  selectedKeys={[currentTab]}
                  mode="inline"
                >
                  {Object.keys(elementsTypeList).map(function(key, index) {
                    const text = elementsTypeList[key];
                    return (
                      <Menu.Item tab={text} key={key}>
                        {text}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </div>
            ) : null}
            <div className={style.tabContent}>
              <EditElementsForm
                isInModal={true}
                formUtils={this.formUtils}
                data={formData}
                formType={currentTab}
                setForm={form => (this.form = form)}
                isEdit={isEdit}
                eleText={eleText}
                ref="sellChanceForm"
              />
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}

export default EditElementsModal;
