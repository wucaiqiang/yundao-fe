import React, { Component } from "react";
import { Button, Icon, message } from "antd";

import style from "./declarationDetail.scss";

import moment from "moment";

export default class DeclarationDetailHead extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data } = this.props;

    if (!data) {
      return null;
    }

    const info = data.data;

    if (!info) {
      return null;
    }

    return (
      <div className={style.header}>
        <div className={style.number}>
          <span>报单编号</span>
          {info.number}
        </div>
        <div className={style.title}>
          {info.customerName || "--"}-{info.productName}
          <span className={style.status}>{info.statusText}</span>
        </div>
        <div className={style.summary}>
          <div className={style.money}>
            <span>认购金额</span>
            {info.dealAmount}万
          </div>
          <div className={style.date}>
            <span>打款日期</span>
            {info.payDate ? moment(info.payDate).format("YYYY-MM-DD") : null}
          </div>
          <p className={style.remark}>备注：{info.remark}</p>
        </div>
      </div>
    );
  }
}
