import React from "react";
import { Icon, Modal, message } from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer";

import style from "./modal.scss";

export default class CustomerRecoverModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      customerNames: []
    };
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {}
  show(data) {
    this.setState({
      ...data,
      visible: true
    });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  handleOk = e => {
    e && e.preventDefault();
    const _this = this;

    let { customerIds } = this.state;

    this.customer.recycle({ customerIds }).then(res => {
      const { failList = [], passList = [] } = res.result || {};

      if (failList && failList.length) {
        let successIds = [],
          messageContent = [],
          messages = {};

        passList.map(item => {
          successIds.push(item.id);
        });

        //汇总错误信息
        failList.map(item => {
          if (!messages[item.code]) {
            messages[item.code] = {
              message: item.message,
              name: [item.name]
            };
          } else {
            messages[item.code].name.push(item.name);
          }
        });

        for (var key in messages) {
          if (messages.hasOwnProperty(key)) {
            let item = messages[key];
            messageContent.push(
              <div key={`message_${key}`}>
                <p>{`${item.message}:`}</p>
                <p>{item.name.join("、")}</p>
              </div>
            );
          }
        }

        if (successIds.length > 0) {
          Modal.confirm({
            width: 460,
            title: `您选择的客户中，以下${failList.length}个客户无法回收：`,
            content: (
              <div>
                <div style={{ paddingTop: 15, paddingBottom: 15 }}>
                  {messageContent}
                </div>
                <p
                  style={{
                    fontSize: "14px"
                  }}
                >
                  是否继续回收其他选中客户？
                </p>
              </div>
            ),
            onOk() {
              let customerIds = successIds.join(",");

              return _this.customer.recycle({ customerIds }).then(res => {
                if (res.success) {
                  message.success("回收客户成功");
                  _this.setState({ visible: false });

                  _this.props.reload && _this.props.reload();
                }
              });
            }
          });
        } else {
          //错误同一个原因时
          if (messageContent.length === 1) {
            messageContent = <p>{failList[0].message}</p>;
          }

          Modal.info({
            title: "您选择的客户无法回收：",
            content: <div style={{ paddingTop: 15 }}>{messageContent}</div>,
            okText: "确定"
          });
        }
      } else if (res.success) {
        message.success("回收客户成功");
        _this.setState({ visible: false });

        _this.props.reload && _this.props.reload();
      }
    });
  };

  render() {
    let { visible, formData } = this.state;
    return (
      <Modal
        visible={visible}
        title="回收客户"
        width={450}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div className="ant-confirm-body-wrapper">
          <div className="ant-confirm-body">
            <i className="anticon anticon-exclamation-circle" />
            <span className="ant-confirm-title">您选择从负责人名下回收以下客户：</span>
            <div className="ant-confirm-content">
              <div>
                <p className="customer-name">{this.state.customerNames}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
