import React, { Component } from "react";
import { Button, Card, Row, Col, Icon } from "antd";

import Base from "components/main/Base";
import Confirm from "components/modal/Confirm";

import EditContactModal from "../editContactModal";

import Customer from "model/Customer/";

import style from "./customerDetail.scss";

export default class CustomerContactPerson extends Base {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.customer = new Customer();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
    }
  }

  handleDel = id => {
    Confirm({
      width: 450,
      wrapClassName: "showfloat",
      title: "删除不能撤回，确定删除?",
      onOk: () => {}
    });
  };
  handleAdd = () => {
    this.EditContactModal.show();
  };
  render() {
    const { data } = this.props;
    if (!data) {
      return null;
    }

    const canEdit = data.info.permission.editPermission;
    const canRead = data.info.permission.readPermission;

    return (
      <div className={style.card}>
        <div className={style.toolBar}>
          <Button className="btn_add" onClick={this.handleAdd}>
            新增联系人
          </Button>
        </div>
        <Card
          title="姓名"
          style={{ marginTop: 0 }}
          extra={<Icon type="close" onClick={this.handleDel} />}
        >
          <Row>
            <Col span="12">手机号码</Col>
            <Col span="12">座机号码</Col>
            <Col span="12">微信</Col>
            <Col span="12">性别</Col>
            <Col span="12">出生日期</Col>
            <Col span="12">职务</Col>
            <Col span="12">邮箱</Col>
            <Col span="12">办公地址</Col>
            <Col span="12">证件正反面</Col>
            <Col span="12">证件有效期</Col>
            <Col span="12">与该机构关系</Col>
          </Row>
        </Card>

        <EditContactModal ref={ref => (this.editContactModal = ref)} />
      </div>
    );
  }
}
