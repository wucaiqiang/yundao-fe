import React, { Component } from "react";
import { Layout,Spin } from 'antd';
import Base from "./Base";

import style from './Page.scss'

export default class Page extends Base {
  state={
    loading:false
  }
  componentDidMount(){
    NProgress.done()

  }


  componentWillReceiveProps(nextProps) {
    // will be true
    const locationChanged = nextProps.location !== this.props.location
    if(locationChanged){
      //点击当前页面 route  更新 route
      NProgress.start()
      this.setState({
        loading:true
      },()=>{
        setTimeout(()=>{
          this.setState({
            loading:false
          })
        })
        NProgress.done()
      })
    }
  }
  render() {
    const { children, route, location } = this.props;
    document.title = route && route.title || this.props.title

    return (
        <Layout className={style.page} >
           <Layout.Content>
          {this.state.loading?<Spin />:children}
          </Layout.Content>
        </Layout>
    );
  }
}
