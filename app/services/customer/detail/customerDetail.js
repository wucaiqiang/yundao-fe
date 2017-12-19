import React, { Component } from "react";
import { Layout, Tabs, Row, Col } from "antd";

import Base from "components/main/Base";

import EnumCustomer from "enum/enumCustomer";

import CustomerHead from "./customerDetailHead";
import CustomerDetailDynamic from "./customerDetailDynamic";
import CustomerDetailChance from "./customerDetailChance";
import CustomerDetailTradingInfo from "./customerDetailTradingInfo";
import CustomerDetailVisit from "./customerDetailVisit";
import CustomerDetailFollow from "./customerDetailFollow";
import CustomerDetailMaterial from "./customerDetailMaterial";
import CustomerDetailRisk from "./customerDetailRisk";
import CustomerContactPerson from "./customerContactPerson";

import style from "./customerDetail.scss";

const { TabPane } = Tabs;
const { EnumCustomerType } = EnumCustomer;

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
  /**
   * 添加跟进回调函数
   *
   * @memberof CustomerDetail
   */
  handleRefreshDynamic = () => {
    this.customerDetailDynamic.reload();
  };
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
    if (!data || !data.info) {
      return null;
    }
    const canRead = data.info.permission && data.info.permission.readPermission;

    return !canRead ? (
      <div className={`${style.customer_detail} error`}>无权限查看</div>
    ) : (
      <div className={style.customer_detail}>
        <CustomerHead data={data} mod={mod} />
        <div className={style.content}>
          <div
            style={{
              display: "flex"
            }}
          >
            <div
              style={{
                flex: 2,
                overflow: "hidden",
                marginRight: "20px"
              }}
            >
              <Tabs
                defaultActiveKey="1"
                activeKey={this.state.activeKey}
                onTabClick={activeKey => {
                  this.setState({ activeKey });
                }}
              >
                <TabPane tab="动态" key="1">
                  <CustomerDetailDynamic
                    ref={ref => (this.customerDetailDynamic = ref)}
                    customerId={data.id}
                  />
                </TabPane>
                <TabPane tab="销售线索" key="0">
                  {this.state.activeKey == "0" ? (
                    <CustomerDetailChance customerId={data.id} parent={this} />
                  ) : null}
                </TabPane>
                <TabPane tab="交易信息" key="2">
                  {this.state.activeKey == "2" ? (
                    <CustomerDetailTradingInfo customerId={data.id} />
                  ) : null}
                </TabPane>
                <TabPane tab="资料" key="3">
                  {this.state.activeKey == "3" ? (
                    <CustomerDetailMaterial data={data} mod={mod} />
                  ) : null}
                </TabPane>
                {data.info.customerType === EnumCustomerType.enum.ORGANIZATION ? (
                  <TabPane tab="联系人" key="4">
                    {this.state.activeKey == "contact" ? (
                      <CustomerContactPerson
                        customerId={data.id}
                        data={data}
                        mod={mod}
                      />
                    ) : null}
                  </TabPane>
                ) : null}
                <TabPane tab="合规管理" key="contact">
                  {this.state.activeKey == "4" ? (
                    <CustomerDetailRisk
                      customerId={data.id}
                      data={data}
                      mod={mod}
                    />
                  ) : null}
                </TabPane>
                <TabPane tab="回访记录" key="6">
                  {this.state.activeKey == "6" ? (
                    <CustomerDetailVisit customerId={data.id} />
                  ) : null}
                </TabPane>
              </Tabs>
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              <CustomerDetailFollow
                data={data}
                customerId={data.id}
                ref={ref => (this.customerDetailFollow = ref)}
                callback={() => {
                  this.handleRefreshDynamic();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerDetail;
