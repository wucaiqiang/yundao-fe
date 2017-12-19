import React, { Component } from "react";
import Base from "components/main/Base";

import { Tabs, Row, Col } from "antd";

import Head from "./head";
import Information from "./information";
import DockingPeople from "./dockingPeople";
import TradingInfo from "./tradingInfo";

import style from "./index.scss";

const { TabPane } = Tabs;

class CustomerDetail extends Base {
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
    const { data, mod } = this.props;
    if (!data || !data.data) {
      return null;
    }

    const { readPermission } = data.permission;

    return !readPermission ? (
      <div className={`${style.detail} error`}>无权限查看</div>
    ) : (
      <div className={style.detail}>
        <Head data={data} mod={mod} />
        <div className={style.content}>
          <Tabs
            defaultActiveKey="1"
            activeKey={this.state.activeKey}
            onTabClick={activeKey => {
              this.setState({ activeKey });
            }}
          >
            <TabPane tab="资料" key="1">
              {this.state.activeKey == "1" ? (
                <Information data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="对接人" key="2">
              {this.state.activeKey == "2" ? (
                <DockingPeople customerId={data.id} data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="交易信息" key="3">
              {this.state.activeKey == "3" ? (
                <TradingInfo customerId={data.id} />
              ) : null}
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default CustomerDetail;
