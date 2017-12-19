import React, { Component } from "react";
import { Button, Card, Row, Col, Icon } from "antd";

import Base from "components/main/Base";
import Confirm from "components/modal/Confirm";

import EditDockingPeopleModal from "../editDockingPeopleModal";

import Channel from "model/Channel/";

import style from "./index.scss";

export default class ChannelDockingPeople extends Base {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.channel = new Channel();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
    }
  }

  handleDel = id => {
    Confirm({
      width: 450,
      wrapClassName: "showfloat",
      title: "确定删除",
      onOk: () => {}
    });
  };
  handleAdd = () => {
    this.editDockingPeopleModal.show();
  };
  render() {
    const { data } = this.props;
    if (!data) {
      return null;
    }

    const canEdit = data.permission.editPermission;
    const canRead = data.permission.readPermission;

    return (
      <div className={style.card}>
        <div className={style.toolBar}>
          <Button className="btn_add" onClick={this.handleAdd}>
            新增对接人
          </Button>
        </div>
        <Card
          title="姓名  当前对接人"
          style={{ marginTop: 0 }}
          extra={<Icon type="close" onClick={this.handleDel} />}
        >
          <Row>
            <Col span="6">手机号码</Col>
            <Col span="6">座机号码</Col>
            <Col span="6">微信</Col>
            <Col span="6">性别</Col>
            <Col span="6">出生日期</Col>
            <Col span="6">职务</Col>
            <Col span="6">邮箱</Col>
            <Col span="6">办公地址</Col>
          </Row>
        </Card>
        <Card
          title="姓名  当前对接人"
          style={{ marginTop: 0 }}
          extra={<Icon type="close" onClick={this.handleDel} />}
        >
          <Row>
            <Col span="6">
              <strong>手机号码</strong>
            </Col>
            <Col span="6">
              <strong>座机号码:</strong>
            </Col>
            <Col span="6">
              <strong>微信:</strong>
            </Col>
            <Col span="6">
              <strong>性别:</strong>
            </Col>
            <Col span="6">
              <strong>出生日期:</strong>
            </Col>
            <Col span="6">
              <strong>职务:</strong>
            </Col>
            <Col span="6">
              <strong>邮箱:</strong>
            </Col>
            <Col span="6">
              <strong>办公:地址</strong>
            </Col>
          </Row>
        </Card>

        <EditDockingPeopleModal
          ref={ref => (this.editDockingPeopleModal = ref)}
        />
      </div>
    );
  }
}
