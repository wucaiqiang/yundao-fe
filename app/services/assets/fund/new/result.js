import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Icon, Button } from "antd";

import Base from "components/main/Base";

import style from "./result.scss";

export default class ProductResult extends Base {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
  }
  render() {
    const { data } = this.props;
    return (
      <div className={style.product_detail}>
        <div className={style.result}>
          <Icon type="check-circle-o" />
          <div className={style.title}>
            <p>新增基金成功,下一步可以在产品管理页面申请上线</p>
          </div>
          <Link to={`/fund/detail/${data.id}`}>
            <Button
              className={"btn_del"}
              style={{
                width: "auto",
                marginRight: "11px"
              }}
            >
              查看基金详情
            </Button>
          </Link>
          <Button
            className={"btn_add"}
            onClick={e => {
              this.props.restart && this.props.restart();
            }}
          >
            继续新增
          </Button>
        </div>
      </div>
    );
  }
}
