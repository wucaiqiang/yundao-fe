import React from "react";
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Icon,
  Modal,
  Spin,
  Table,
  message
} from "antd";

import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Clue from "model/Clue";

import style from "./modal.scss";

const FormItem = Form.Item;

export default class VisitViewModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      detail: null
    };
  }
  componentWillMount() {
    this.clue = new Clue();
  }
  componentDidMount() {}
  show(data) {
    this.setState({
      loading: true,
      visible: true
    });

    this.getData(data.id);
  }

  getData(id) {
    this.clue.getVisit(id).then(res => {
      let detail;
      if (res.success) {
        detail = res.result;
      }

      this.setState({ loading: false, detail });
    });
  }
  handleCancel = () => {
    this.setState({ visible: false, detail: null });
  };
  renderDetail(data) {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    let content;
    if (data === null) {
      content = null;
    } else if (data.isProcess) {
      content = (
        <Form className={style.visitForm}>
          <FormItem label="回访时间" {...formItemLayout}>
            {data.visitDate &&
              moment(data.visitDate).format("YYYY-MM-DD hh:mm")}
          </FormItem>
          <FormItem label="回访方式" {...formItemLayout}>
            {data.typeText}
          </FormItem>
          <FormItem label="回访状态" {...formItemLayout}>
            {data.statusText}
          </FormItem>
          <FormItem label="回访内容" {...formItemLayout}>
            {data.content}
          </FormItem>
          <FormItem label="客户状态" {...formItemLayout}>
            {data.customerStatusText}
          </FormItem>
          <FormItem label="回访负责人" {...formItemLayout}>
            {data.userName}
          </FormItem>
        </Form>
      );
    } else {
      content = (
        <Form className={style.visitForm}>
          <FormItem label="暂未回访" {...formItemLayout} />
          <FormItem label="回访负责人" {...formItemLayout}>
            {data.userName}
          </FormItem>
        </Form>
      );
    }

    return content;
  }
  render() {
    let { visible, detail } = this.state;
    return (
      <Modal
        visible={visible}
        title="回访情况"
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleCancel}
        footer={[<Button key="close" onClick={this.handleCancel}>关闭</Button>]}
      >
        <Spin spinning={this.state.loading}>{this.renderDetail(detail)}</Spin>
      </Modal>
    );
  }
}
