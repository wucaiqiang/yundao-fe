import React, { Component } from "react";
import { Spin } from "antd";

import FloatPanelBase from "base/floatPanelBase";

// import DeclarationDetail from "./declarationDetail";

import Declaration from 'model/Declaration/'

let DeclarationDetail =null

class DeclarationDetailFloat extends FloatPanelBase {
  state = {
    loading: true,
    visible: false,
  };
  constructor(props) {
    super(props);
    this.declaration = new Declaration()
  }
  // show = data => {
  //   this.visible()
  //   this.setState({ loading: true,data },()=>{
  //     this.loadData()
  //   });
  // };


  show = data => {
    const that = this
    if(!this.state.showOnce){

      require.ensure(['./declarationDetail'], function(require){
        DeclarationDetail = require('./declarationDetail').default
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

  setVisible=(data)=>{

    this.visible()
    this.setState({ loading: true,data },()=>{
      this.loadData()
    });
  }

  loadData =()=>{
    const {id} = this.state.data
    return this.declaration.get_detail(id).then(res=>{
      if(res.success){
        let data = res.result;
        data.id = id
        this.setState({
          data,
          id,
          loading:false
        })
      }else{
        this.setState({
          loading:false,
          error:true
        })
      }
      return res
    })
  }

  reloading = ()=>{
    this.setState({
      loading:true
    })
    this.loadData()
  }

  hide() {
    this.setState({ visible: false });
  }

  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap float-declaration-detail-wrap");
    if (this.state.visible) {
      cls.push("open");
    }
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }

  render() {
    return (
      <div className={this.getDetailClass()}>
        {this.state.loading ? <Spin /> : <div className="float-detail" ref={ref=>{
            if(ref){
              this.affixContainer = ref
            }
          }}>
          {this.state.error?<div onClick={this.reloading}>数据有误，点击尝试重新加载</div>:this.state.data?<DeclarationDetail mod={this}  data={this.state.data}/>:null}
        </div>}
        
      </div>
    );
  }
}

export default DeclarationDetailFloat;
