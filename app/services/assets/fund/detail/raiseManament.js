import React, { Component } from "react";
import { Row, Col } from "antd";

import Base from "components/main/Base";

import RaiseInfo from "./raiseInfo";
import ConnectedProductInfo from "./connectedProductInfo";

import style from "./tabs.scss";

export default class ProductDetail extends Base {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
  }

  render() {
    const { data, mod } = this.props;
    return (
      <div className={style.body}>
        <Row>
          <RaiseInfo mod={mod} data={data} />
        </Row>
        <Row>
          <ConnectedProductInfo mod={mod} data={data} />
        </Row>
      </div>
    );
  }
}
