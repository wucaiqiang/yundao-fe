import React, { Component } from "react";

import { Row, Col, message, Affix } from "antd";

import style from "./tabs.scss";

import Base from "components/main/Base";
import DynamicFormItem from "components/Form/DynamicFormItem";
import DynamicFormItemView from "components/Form/DynamicFormItemView";

import FundInfoForm from "./fundInfoForm";
import FundAttach from "./fundAttach";

import Fund from "model/Assets/fund";

class BaseInfo extends Base {
  state = {
    edit: false
  };
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
      //加载不同的资料 设置为非编辑状态
      this.setState({ isEdit: false });
    }
  }

  submit = () => {
    const { data, mod } = this.props;

    if (this.state.submiting) {
      return;
    }
    this.fundInfoForm.submit(values => {
      values.id = data.id;
      values.typeId = data.typeId;
      const fund = new Fund();
      this.setState({
        submiting: true
      });
      fund.baseUpdate(values).then(res => {
        this.setState({
          submiting: false
        });
        if (res.success) {
          message.success("基金信息更新成功");

          mod.loadData &&
            mod.loadData().then(res => {
              this.setState({ isEdit: false });
            });
          mod.refreshRootList && mod.refreshRootList();
        }
      });
    });
  };

  formatFieldType = field => {
    if (field.name == "assistantId") {
      //助理
      field.typeCode = "search_select";
    } else if (field.name == "receiverId") {
      //负责人
      field.typeCode = "search_select";
    }

    return field;
  };

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
    const fields = data.fundDto.data.fundFieldDtos.map(this.formatFieldType);

    const canEdit =
      data.fundDto.permission.editPermission && data.examineStatus != 1;
    const canRead = data.fundDto.permission.readPermission;

    const { formLayout } = this.state;
    const formItemLayout =
      formLayout === "horizontal"
        ? {
            labelCol: {
              span: 4
            },
            wrapperCol: {
              span: 14
            }
          }
        : null;
    const renderFormItem = (field, index) => {
      return (
        <DynamicFormItemView
          key={index}
          field={field}
          formUtils={this.formUtils}
          {...formItemLayout}
        />
      );
    };

    let leftCol = [],
      rightCol = [],
      index = 0;
    while (index < fields.length) {
      var field = fields[index];
      var nextField = fields[index + 1];

      {
        !field ? null : leftCol.push(renderFormItem(field, index));
      }
      {
        !nextField ? null : rightCol.push(renderFormItem(nextField, index + 1));
      }
      index = index + 2;
    }

    const icons = [];

    if (this.state.isEdit) {
      icons.push(
        <img
          key="action1"
          className="anticon"
          src="/assets/images/icon/取消@1x.png"
          srcSet="/assets/images/icon/取消@2x.png"
          onClick={e => {
            this.setState({ isEdit: false });
          }}
        />
      );
      icons.push(
        <img
          key="action2"
          className="anticon"
          src="/assets/images/icon/确认@1x.png"
          srcSet="/assets/images/icon/确认@2x.png"
          onClick={this.submit}
        />
      );
    } else {
      if (canRead && canEdit) {
        icons.push(
          <img
            key="action3"
            className="anticon anticon-edit"
            src="/assets/images/icon/编辑@1x.png"
            srcSet="/assets/images/icon/编辑@2x.png"
            onClick={e => {
              this.setState({ isEdit: true });
            }}
          />
        );
      }
    }

    return (
      <div
        className={style.card}
        style={{
          marginRight: "24px"
        }}
      >
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>基金信息</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
          {this.state.isEdit ? (
            <FundInfoForm
              data={data}
              ref={ref => {
                if (ref) {
                  this.fundInfoForm = ref;
                }
              }}
            />
          ) : (
            <Row>
              <Col span={12} style={{ paddingRight: 20 }}>
                {leftCol}
              </Col>
              <Col span={12}>{rightCol}</Col>
            </Row>
          )}
        </div>
      </div>
    );
  }
}

export default class FundInfo extends Base {
  state = {
    loading: true,
    visible: false,
    edit: false
  };
  constructor(props) {
    super(props);
  }

  render() {
    const { data, mod } = this.props;

    return (
      <div className={style.body}>
        <Row>
          <Col span="14">
            <BaseInfo mod={mod} data={data} />
          </Col>
          <Col span="10">
            <FundAttach data={data} />
          </Col>
        </Row>
      </div>
    );
  }
}
