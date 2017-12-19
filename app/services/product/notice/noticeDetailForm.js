import React from "react";
import { Checkbox, Button, Form, Row, Col, Icon } from "antd";
import Base from "components/main/Base";
import Utils from "utils/";

const FormItem = Form.Item;

export default class NoticeDetailForm extends Base {
  renderAttach = attachs => {
    return attachs && attachs.length > 0
      ? attachs.map(attach => {
          return (
            <p key={attach.id}>
              <a className="yellow" href={attach.url} target="_blank">
                {attach.sourceName}
              </a>
            </p>
          );
        })
      : null;
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    let { data } = this.props;

    data.sendTime = Utils.formatDate(data.sendTime, "YYYY-MM-DD HH:mm:ss");

    return (
      <Form className={`float-slide-form vant-spin detail-form`}>
        <FormItem label="产品名称" {...formItemLayout}>
          <p style={{ marginTop: "10px", lineHeight: "20px" }}>
            {data.productName}
          </p>
        </FormItem>
        <FormItem label="公告类型" {...formItemLayout}>
          {data.noticeTypeName}
        </FormItem>
        <FormItem label="公告标题" {...formItemLayout}>
          {data.title}
        </FormItem>
        <FormItem label="公告概要" {...formItemLayout}>
          {data.content}
        </FormItem>
        <FormItem label="发布方式" {...formItemLayout}>
          {data.isTimingSend == 1 ? `指定时间发布   ${data.sendTime}` : "审批后立刻发布"}
        </FormItem>
        <FormItem label="附件上传" {...formItemLayout}>
          <div style={{ marginTop: "10px", lineHeight: "20px" }}>
            {this.renderAttach(data.baseProductNoticeAttach)}
          </div>
        </FormItem>
      </Form>
    );
  }
}
