import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";

import moment from "moment";

import Base from "components/main/Base";

import Assets from "model/Assets/";

import style from "./auditRecordModal.scss";

export default class AuditRecordModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      data: {},
      record: null
    };
  }
  componentWillMount() {
    this.assets = new Assets();
  }
  componentDidMount() {}
  show(data = {}) {
    if (data.mode === "project") {
      this.request = this.assets.get_project_audit_detail;
    } else if (data.mode === "decision") {
      this.request = this.assets.get_decision_audit_detail;
    } else {
      return;
    }

    this.setState({ visible: true, loading: true, data });

    this.getData(data.id);
  }
  getData = id => {
    this.request(id).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        this.setState({ record: res.result });
      }
    });
  };
  handleClose = () => {
    this.setState({ visible: false, record: null });
  };

  renderRow(row, index) {
    return (
      <div className={style.record_item} key={`row_${index}`}>
        <div
          className={`${style.record_item_time} ${index === 0
            ? "first_item_time"
            : ""}`}
        >
          <span>
            {row.endTime && moment(row.endTime).format("YYYY-MM-DD HH:mm")}
          </span>
          {row.name}
        </div>
        <div className={style.record_item_body}>
          <p>
            <span>
              <label className={style.record_item_body_label}>操作人：</label>
              {row.actionUserName}
            </span>
            {row.actionText ? (
              <span>
                <label className={style.record_item_body_label}>动作：</label>
                {row.actionText}
              </span>
            ) : null}
          </p>
          {row.comment ? (
            <p>
              <label className={style.record_item_body_label}>原因：</label>
              {row.comment}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  renderGroup(group) {
    return (
      <div className={style.record_group} key={group.name}>
        <div className={style.record_title}>{group.name}</div>
        {group.list &&
          group.list.map((row, index) => {
            return this.renderRow(row, index);
          })}
      </div>
    );
  }
  render() {
    let { visible, loading, data, record } = this.state;
    return (
      <Modal
        visible={visible}
        title={"审批记录"}
        width={500}
        closable={true}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        footer={[
          <Button key="close" onClick={this.handleClose}>
            关闭
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          <div className={style.record}>
            {record && record.length > 0 ? (
              data.mode === "project" ? (
                record.map(group => {
                  return this.renderGroup(group);
                })
              ) : data.mode === "decision" ? (
                record.map((row, index) => {
                  return this.renderRow(row, index);
                })
              ) : null
            ) : (
              <div className={style.record_empty}>暂无记录</div>
            )}
          </div>
        </Spin>
      </Modal>
    );
  }
}
