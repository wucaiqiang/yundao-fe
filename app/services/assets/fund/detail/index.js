import React, { Component } from "react";
import Base from "components/main/Base";

import { Layout, Tabs, Alert } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const { TabPane } = Tabs;

import HeadInfo from "./headInfo";
import FundInfo from "./fundInfo";
import TeamInfo from "./teamInfo";
import RaiseManament from "./raiseManament";
import ProfitMode from "./profitMode";
import Portfolio from "./portfolio";
import Withdrawal from "./withdrawal";

import style from "./index.scss";

import utils from "utils/";

class ProductDetail extends Base {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.setState({
      activeKey: this.props.data.activeKey || "1"
    });
  }

  componentWillReceiveProps(nextProps) {}
  render() {
    const { data, mod } = this.props;
    return (
      <div className={style.product_detail}>
        <HeadInfo data={data} mod={mod} />
        <div className={style.content}>
          <Tabs
            defaultActiveKey="1"
            activeKey={this.state.activeKey}
            onTabClick={activeKey => {
              this.setState({ activeKey });
            }}
          >
            <TabPane tab="基金信息" key="1">
              {this.state.activeKey == "1" ? (
                <FundInfo data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="管理团队" key="2">
              {this.state.activeKey == "2" ? (
                <TeamInfo data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="募集管理" key="3">
              {this.state.activeKey == "3" ? (
                <RaiseManament data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="收益模式" key="4">
              {this.state.activeKey == "4" ? (
                <ProfitMode data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="投资组合" key="5">
              {this.state.activeKey == "5" ? (
                <Portfolio data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="退出管理" key="6">
              {this.state.activeKey == "6" ? (
                <Withdrawal data={data} mod={mod} />
              ) : null}
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default ProductDetail;
