import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";

import moment from "moment";

import Base from "components/main/Base";

import Product from "model/Product/";

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
    this.product = new Product();
  }
  componentDidMount() {}
  show(data) {
    this.setState({ visible: true, loading: true });

    this.getData(data.productId);
  }
  getData = productId => {
    this.product.auditRecord(productId).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        this.setState({ data: res.result });
      }
    });
  };
  handleClose = () => {
    this.setState({ visible: false, data: {} });
  };

  renderGroup(group) {
    return (
      <div className={style.record_group} key={group.businessNo}>
        <div className={style.record_title}>{group.typeText}</div>
        {group.auditList &&
          group.auditList.map((row, index) => {
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
          })}
      </div>
    );
  }
  render() {
    let { visible, loading, data } = this.state;
    return (
      <Modal
        visible={visible}
        title={"审批记录"}
        width={500}
        closable={true}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        footer={[
          <Button key="close" onClick={this.handleClose}>
            关闭
          </Button>
        ]}
      >
        
        <Spin spinning={loading}>
          <div className={style.record}>
            {data && data.length > 0 ? (
              data.map(group => {
                return this.renderGroup(group);
              })
            ) : (
              <div className={style.record_empty}>暂无记录</div>
            )}
          </div>
        </Spin>
      </Modal>
    );
  }
}
