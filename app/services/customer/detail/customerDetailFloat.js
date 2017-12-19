import React, { Component } from "react";
import { Spin, message } from "antd";

import FloatPanelBase from "base/floatPanelBase";

// import CustomerDetail from "./customerDetail";


import Customer from "model/Customer/";

let CustomerDetail =null

class CustomerDetailFloat extends FloatPanelBase {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
    this.customer = new Customer();
  }
  // show = data => {
    
  // };

  show = data => {
    const that = this
    if(!this.state.showOnce){

      require.ensure(['./customerDetail'], function(require){
        CustomerDetail = require('./customerDetail').default
         that.setState({
          showOnce:true
         },()=>{
          that.setVisible(data)
         })
      });

    }else{
      this.setVisible(data)
    }
  };

  setVisible=data=>{
    this.visible();
    this.setState({ loading: true, data }, () => {
      this.loadData();
    });
  }


  loadData = () => {
    const { id, open_source } = this.state.data;
    let request = this.customer.get_detail;
    if (open_source == "customer_opensea") {
      //来自客户公海的使用另外一个接口
      request = this.customer.get_detail_from_opensea;
    }
    request(id).then(res => {
      this.setState({
        loading: false
      });
      if (res.success) {
        let data = res.result;
        data.id = id;
        this.setState({
          data,
          id
        });
      }
    });
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  reloading = () => {
    this.setState(
      {
        loading: true
      },
      () => {
        this.loadData();
      }
    );
  };

  refreshGrid = () => {
    this.props.reload && this.props.reload();
  };

  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap float-customer-detail-wrap");
    if (this.state.visible) {
      cls.push("open");
    }
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }
  handleCallback = () => {
    this.customerDetail.handleRefreshDynamic();
  };
  render() {
    return (
      <div className={this.getDetailClass()}>
        {this.state.loading ? (
          <Spin />
        ) : (
          <div
            className="float-detail"
            ref={ref => {
              if (ref) {
                this.affixContainer = ref;
              }
            }}
          >
            {this.state.data ? (
              <CustomerDetail
                ref={ref => {
                  this.customerDetail = ref;
                }}
                mod={this}
                data={this.state.data}
              />
            ) : null}
          </div>
        )}
      </div>
    );
  }
}

export default CustomerDetailFloat;
