import React, { Component } from "react";
import Base from "components/main/Base";

import { Layout, Tabs, Alert, Row, Col } from "antd";
import Declaration from "model/Declaration";

const { Header, Content, Footer, Sider } = Layout;

const { TabPane } = Tabs;

import DeclarationHead from "./declarationDetailHead";
import DeclarationDetailInfo from "./declarationDetailInfo";

import style from "./declarationDetail.scss";

class DeclarationDetail extends Base {
  state = {
    loading: true,
    visible: false,
    tipMessage: ""
  };
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.declaration = new Declaration();

    this.getValidate();
  }
  getValidate = () => {
    const { data } = this.props;
    this.declaration.validate(data.id).then(res => {
      this.setState({ tipMessage: res.success ? "" : res.message });
    });
  };
  render() {
    const { data, mod } = this.props;
    const { tipMessage } = this.state;

    return (
      <div className={style.declaration_detail}>
        <DeclarationHead data={data} />
        {tipMessage ? (
          <div className={style.alert}>
            <Alert
              message={<p>待完善资料：{tipMessage}</p>}
              type="warning"
              showIcon
            />
          </div>
        ) : null}
        <div className={style.content}>
          <DeclarationDetailInfo data={data} mod={mod} parent={this} />
        </div>
      </div>
    );
  }
}

export default DeclarationDetail;
