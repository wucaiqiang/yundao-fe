import React from "react";
import { Button, Icon, Modal, Spin, message, Popover } from "antd";

import moment from "moment";

import Base from "components/main/Base";
import Permission from "components/permission";

import DiscardModal from "./discardModal";

import Appoint from "model/Appoint/";

import style from "./auditRecordModal.scss";

export default class AuditRecordModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      data: { discard: false, auditList: null }
    };
  }
  componentWillMount() {
    this.appoint = new Appoint();
  }
  componentDidMount() {}
  show(data) {
    //预约记录编号，作废操作有用
    this.id = data.id;

    this.setState({ visible: true, loading: true });

    this.getData();
  }
  getData = () => {
    const _this = this;
    this.appoint.audit_record({ id: this.id }).then(res => {
      _this.setState({ loading: false });
      if (res.success) {
        _this.setState({ data: res.result });
      }
    });
  };
  handleClose = () => {
    this.setState({ visible: false, data: {} });
  };

  handleCallBack = () => {
    this.getData();
    this.props.reload();
  };
  render() {
    const PermissionButton = Permission(
      <a
        className={`fr ${style.titleLink}`}
        onClick={() => this.discardModal.show({ id: this.id })}
      >
        作废
      </a>,
      <Popover placement="topLeft" content="无权限操作" arrowPointAtCenter>
        <span className="disabled">作废</span>
      </Popover>
    );

    let { visible, loading, data } = this.state;

    return (
      <Modal
        visible={visible}
        title={
          <div>
            {"审批记录"}
            {data.status === 2 && data.hasDeclaration === false ? (
              <PermissionButton auth="reservation.audit.discard" />
            ) : null}
          </div>
        }
        width={500}
        closable={data.status === 2 && data.hasDeclaration}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        footer={[
          <Button key="close" onClick={this.handleClose}>
            关闭
          </Button>
        ]}
      >
        <div className={style.record}>
          <Spin spinning={loading}>
            {data.discard ? (
              <div className={style.record_reject}>
                <div className={style.record_reject_body}>
                  {`${moment(data.discardTime).format(
                    "YYYY-MM-DD HH:mm"
                  )}  已作废，操作人：${data.discardUserName}`}
                  <p>原因：{data.reason}</p>
                </div>
              </div>
            ) : null}

            {data.auditList && data.auditList.length > 0 ? (
              data.auditList.map((row, index) => {
                return (
                  <div className={style.record_item} key={row.id}>
                    <div
                      className={`${style.record_item_time} ${index === 0
                        ? "first_item_time"
                        : null}`}
                    >
                      <span>
                        {row.endTime &&
                          moment(row.endTime).format("YYYY-MM-DD HH:mm")}
                      </span>
                      {row.name}
                    </div>
                    <div className={style.record_item_body}>
                      <p>
                        <span>
                          <label className={style.record_item_body_label}>
                            操作人：
                          </label>
                          {row.actionUserName}
                        </span>
                        {row.actionText ? (
                          <span>
                            <label className={style.record_item_body_label}>
                              动作：
                            </label>
                            {row.actionText}
                          </span>
                        ) : null}
                      </p>
                      {row.comment ? (
                        <p>
                          <label className={style.record_item_body_label}>
                            原因：
                          </label>
                          {row.comment}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={style.record_empty}>暂无记录</div>
            )}
          </Spin>
          <DiscardModal
            ref={ref => (this.discardModal = ref)}
            callback={this.handleCallBack}
          />
        </div>
      </Modal>
    );
  }
}
