import React, { Component } from "react";
import { Button, Icon, Card, message, Popover } from "antd";
import moment from "moment";

import FormUtils from "lib/formUtils";

import CustomerFollowForm from "../my/customerFollowForm";

import Customer from "model/Customer/";

import Base from "components/main/Base";

import style from "./customerDetail.scss";

export default class CustomerDetailFollow extends Base {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      pageSize: 10,
      datas: null,
      totalPage: 0,
      submiting: false
    };

    this.formUtils = new FormUtils("customerFollowForm");
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {
    let customerId = this.props.customerId;

    this.formUtils.setFieldsValue({ customerId });
    this.getData(customerId);
  }

  componentWillReceiveProps(nextProps) {
    const customerId = this.props.customerId;
    if (nextProps.customerId !== customerId) {
      this.formUtils.setFieldsValue({ customerId: nextProps.customerId });
      this.getData(nextProps.customerId);
    }
  }
  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm");
        }
        values[key] = v;
      }
    }
    return values;
  }

  getData = (customerId, currentPage = 1, pageSize = 10) => {
    const { data } = this.props;
    const canRead =
      data.follow.permission && data.follow.permission.readPermission;
    if (!canRead) {
      return;
    }
    let params = {
      currentPage,
      pageSize,
      customerId
    };

    this.customer.gets_follow(params).then(res => {
      if (res.success) {
        let { currentPage, pageSize, datas, totalPage } = res.result;

        this.setState({ currentPage, pageSize, datas, totalPage });
      }
    });
  };
  /**
   * 发布跟进
   *
   * @memberof CustomerDetailHead
   */
  handleFollow = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);

        this.setState({ submiting: true });
        this.customer.follow(formData).then(res => {
          this.setState({ submiting: false });
          if (res.success) {
            this.formUtils.resetFields([
              "type",
              "status",
              "content",
              "nextFollowDate"
            ]);

            message.success("添加跟进成功");
            //第一页时重新加载
            if (this.state.currentPage === 1) {
              this.getData(formData.customerId);
            }

            let { callback } = this.props;
            callback && callback();
          }
        });
      }
    });
  };
  render() {
    const { customerId, data } = this.props;
    const { currentPage, pageSize, datas, totalPage, submiting } = this.state;

    const {
      readPermission: canRead,
      editPermission: canEdit
    } = data.follow.permission;

    return (
      <Card title="跟进" bordered={false} className={style.followForm}>
        <div>
          <CustomerFollowForm
            ref={form => (this.customerFollowForm = form)}
            formUtils={this.formUtils}
            setForm={form => (this.form = form)}
          />
          <div className={style.actions}>
            {canEdit ? (
              <Button onClick={this.handleFollow} loading={submiting}>
                发布
              </Button>
            ) : (
              <Popover placement="topRight" content={"仅限客户归属人可录入跟进记录"}>
                <Button disabled={true}>发布</Button>
              </Popover>
            )}
          </div>
        </div>
        {canRead ? (
          <div className={style.follow}>
            {datas &&
              datas.map(row => {
                return (
                  <div className={style.follow_item} key={row.id}>
                    <div className={style.follow_item_time}>
                      <span>
                        {row.createDate &&
                          moment(row.createDate).format("YYYY-MM-DD HH:mm")}
                      </span>
                    </div>
                    <div className={style.follow_item_body}>
                      <p>
                        <label className={style.follow_item_body_label}>
                          跟进方式：
                        </label>
                        {row.typeText}
                      </p>
                      <p>
                        <label className={style.follow_item_body_label}>
                          跟进内容：
                        </label>
                        {row.content}
                      </p>
                    </div>
                  </div>
                );
              })}

            {datas === null || datas.length === 0 ? (
              <div className={style.follow_empty}>暂无跟进记录</div>
            ) : (
              <div className={style.pagination}>
                <Button
                  disabled={currentPage === 1}
                  onClick={() => {
                    this.getData(customerId, currentPage - 1, pageSize);
                  }}
                >
                  <Icon type="left" />
                </Button>
                <Button
                  disabled={currentPage >= totalPage}
                  onClick={() => {
                    this.getData(customerId, currentPage + 1, pageSize);
                  }}
                >
                  <Icon type="right" />
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Card>
    );
  }
}
