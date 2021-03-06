import React, { Component } from "react";
import Base from "components/main/Base";
import Upload from "components/upload/";

import { Layout, Icon, Tabs,Checkbox,message } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const { TabPane } = Tabs;

const CheckboxGroup = Checkbox.Group;

import style from "./attachment.scss";

import {generatorEditForm} from 'components/Form/SingleEditForm'



class ProductAttachment extends Base {
  state = {
    loading: true,
    visible: false,
    edit: true,
    data: []
  };
  mime2icon = {
    "application/pdf": "pdf",
    "application/vnd.ms-excel": "xls",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "image/jpeg": "jpg",
    "image/png": "png"
  };
  constructor(props) {
    super(props);
  }

  deleteUploadList(id) {
    const list = this.state.data || [];

    let data, newList;

    data = this.state.data;
    newList = [];
    list.map(item => {
      if (item.id != id) {
        newList.push(item);
      }
    });
    this.setState({ data: newList });
  }

  preview(url) {
    setTimeout(() => {
      window.open(url);
    });
  }

  showTypeOptions=[
    { label: '内部可见', value: '1' },
    { label: '客户可见', value: '2' },
  ]


  updateType(uid,value){
    console.log('uid',uid)
    console.log('value',value)
    if (!value || !value.length){
      message.error('请最少选择一处可见')
      return ;
    }

    const list = this.state.data || [];

    let data, newList;

    data = this.state.data;
    newList=list.map(item => {
      if (item.uid == uid) {
        item.showType = value
      }
      return item
    });
    console.log('newList',newList)
    this.setState({ data: newList });
  }

  submit(callback) {
    let data = {};
    if (this.state.data.length) {
      data = {
        attachDtos: JSON.stringify(
          this.state.data.map(item => {
            item.sourceName = item.name;
            if(!item.showType || !item.showType.length){
              item.showType = 3
            }
            if(item.showType.length  == this.showTypeOptions.length){
              item.showType = 0
            }
            return item;
          })
        )
      };
    }
    callback(data);
  }

  render() {


    return (
      <div className={style.product_detail}>
        <ul className={style.images}>
          {this.state.data.map(item => {
            return (
              <li className={style.image}>
              {item.status =='uploading'? <div className={style.uploaded}><div>上传中...</div></div>:
              item.status =='done'?
                <div className={style.uploaded}>
                  <img
                    className={
                      item.type.indexOf("image") > -1 ? null : style.file
                    }
                    src={
                      item.type.indexOf("image") > -1
                        ? item.url
                        : `/assets/images/ext/${
                            item.type?this.mime2icon[item.type]:item.name.split('.')[item.name.split('.').length-1]
                          }@1x.png`
                    }
                    alt="附件"
                  />
                  <div className={style.btns}>
                    <Icon
                      type="close"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const { data } = this.state;
                        this.setState({
                          data: data.filter(asset => asset.url != item.url)
                        });
                      }}
                    />
                  </div>
                </div>:null}
                {item.status == 'done'?<div>
                <CheckboxGroup value={item.showType === 0 ?['1','2']:item.showType} options={this.showTypeOptions} onChange={value=>{
        this.updateType(item.uid,value)
      }} />
                </div>:null}
                <p>{item.name}</p>
              </li>
            );
          })}
          {this.state.data.length < 9 ? (
            <li className={style.image}>
              <Upload
                showUploadList={false}
                max={1}
                fileList={this.state.data}
                accept="docx,doc,pdf,jpg,jpeg,png,xlsx,xls,txt"
                onChange={fileList => {
                  this.setState({ data:fileList.filter(item=>item.status!='error').map(item=>{
                    if(item.showType === undefined){
                      item.showType =this.showTypeOptions.map(item=>item.value)
                    }
                    return item
                  }) });
                }}
              >
                <div className={style.upload_btn}>
                  <img
                    src="/assets/images/icon/上传2@1x.png"
                    srcSet="/assets/images/icon/上传2@2x.png"
                  />
                  <p>点击将文件上传</p>
                </div>
              </Upload>
            </li>
          ) : null}
        </ul>
      </div>
    );
  }
}

export default ProductAttachment;
