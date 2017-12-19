import React, {Component} from "react";
import Base from "components/main/Base";

import {Layout, Tabs, Alert} from "antd";

const {Header, Content, Footer, Sider} = Layout;

const {TabPane} = Tabs;

import ProductHead from "./productDetailHead";
import ProductInfo from "./productDetailInfo";
import ProductSale from "./productDetailSale";
import ProductProfit from "./productDetailProfit";
import ProductTrade from "./productDetailTrade";
import ProductAnnounce from "./productDetailAnnounce";

import style from "./productDetail.scss";

import utils from 'utils/'

class ProductDetail extends Base {
  state = {
    loading: true,
    visible: false,
    showWarn: false
  };
  constructor(props) {
    super(props);

  }
  componentWillMount() {
    const {data} = this.props

    const {tab} = utils.parseQuery(location.href)

    const tabs = {
      'announce': '5'
    }

    this.state = {
      activeKey: tabs[tab] || '1'
    }

  }

  resetShowWarn = (data) => {
    // const showProdocutEditWarn = utils.getStorage('hideProdocutEditWarn') == true
    //   ? false
    //   : true
    if (data.examineStatus == 1 ) {
      this.setState({showWarn: true});
    }
  }

  // hideProdocutEditWarn = () => {
  //   this.setState({showWarn: false})
  //   utils.setStorage('hideProdocutEditWarn', false)
  // }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded
    // render
    if (nextProps.data !== this.state.data) {
      this.resetShowWarn(nextProps.data)
    }
  }
  render() {
    const {data, mod} = this.props
    return (
      <div className={style.product_detail}>
        <ProductHead data={data}/>
        <div className={style.content}>
          <div
            className={style.message}
            style={{
            display: this.state.showWarn
              ? 'block'
              : 'none'
          }}>
            <Alert
              message={< p > 审批中的产品不可编辑。</p >}
              type="warning"
              showIcon/>

          </div>
          <Tabs defaultActiveKey="1" activeKey={this.state.activeKey} onTabClick={activeKey=>{
                this.setState({activeKey})
                }}
                >
            <TabPane tab="产品信息" key="1">
              {this.state.activeKey == '1'?<ProductInfo data={data} mod={mod}/>:null}
            </TabPane>
            <TabPane tab="销售信息" key="2">
            {this.state.activeKey == '2'?<ProductSale data={data} mod={mod}/>:null}
            </TabPane>
            <TabPane tab="收益模式" key="3">
            {this.state.activeKey == '3'?<ProductProfit data={data} mod={mod}/>:null}
            </TabPane>
            <TabPane tab="交易信息" key="4">
            {this.state.activeKey == '4'?<ProductTrade productId={data && data.id} data={data}/>:null}
            </TabPane>
            <TabPane tab="信息披露" key="5">
            {this.state.activeKey == '5'?<ProductAnnounce productId={data && data.id} data={data}/>:null}
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default ProductDetail;
