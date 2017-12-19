import React, { Component } from "react";
import { Tabs } from "antd";

import Base from "components/main/Base";

import Head from "./Head";
import Supplier from "./Supplier";
import PaymentRecord from "./PaymentRecord";
import RelateTransaction from "./RelateTransaction";

import style from "./Index.scss";

const { TabPane } = Tabs;

export default class Detail extends Base {
  state = {
    loading: true,
    visible: false,
    activeKey: "1"
  };
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.setState({
      activeKey: this.props.data.activeKey || "1"
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.activeKey) {
      console.log("nextProps.data", nextProps.data);
      this.setState({
        activeKey: nextProps.data.activeKey
      });
    }
  }
  render() {
    const { data = {}, mod } = this.props;
    const { activeKey } = this.state;
    return (
      <div className={style.detail}>
        <Head data={data} mod={mod} />
        <div className={style.content}>
          <div className={style.supplier}>
            <Supplier data={data} />
          </div>
          <Tabs
            defaultActiveKey="1"
            activeKey={activeKey}
            onTabClick={activeKey => {
              this.setState({ activeKey });
            }}
          >
            <TabPane tab="回款记录" key="1">
              {activeKey == "1" ? (
                <PaymentRecord data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="关联交易" key="2">
              {activeKey == "2" ? <RelateTransaction data={data} mod={mod}/> : null}
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}
