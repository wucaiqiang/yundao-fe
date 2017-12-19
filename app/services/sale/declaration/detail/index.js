import React, { Component } from "react";
import { Spin } from "antd";

import FloatPanelBase from "base/floatPanelBase";

import DeclarationDetail from "./declarationDetail";

import Declaration from 'model/Declaration/'

class DeclarationDetailFloat extends FloatPanelBase {
  state = {
    loading: true,
    visible: false,
  };
  constructor(props) {
    super(props);
    this.declaration = new Declaration()
    const {location, match} = this.props;
    
        const {id} = match.params;
    
        this.state = {
          id: id
        }
  }

  
  componentWillMount() {
    this.loadData()
  }



  loadData =()=>{
    const {id} = this.state
    this.declaration.get_detail(id).then(res=>{
      if(res.success){
        let data = res.result;
        data.id = id
        this.setState({
          data,
          id,
          loading:false
        })
      }else{
        this.setState({loading: false,error:true,message:res.message})
      }
    })
  }

  reloading = ()=>{
    this.setState({
      loading:true
    })
    this.loadData()
  }



  render() {
    return (
      <Page {...this.props}>
      <Breadcrumb className="page-breadcrumb">
        <Breadcrumb.Item>报单详情</Breadcrumb.Item>
      </Breadcrumb>
      <div className="page-content">
        <Spin spinning={this.state.loading}>
        {this.state.error?<div className="error" onClick={this.reloading}>{this.state.message},点击重新加载</div>:<DeclarationDetail  mod={this} data={this.state.data}/>}
        </Spin>
      </div>
    </Page>
    );
  }
}

export default DeclarationDetailFloat;
