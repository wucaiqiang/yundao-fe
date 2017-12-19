import React, {Component} from "react";
import {Button, Icon} from "antd";

import style from "./productDetail.scss";

import Product from 'model/Product/'


class FocusBtn extends Component{
  render(){
    const {active,...others} = this.props
    const heart = active? '已关注':'加关注'
    return (
      <Button className={style.btnfollow} {...others}>
        <img src={`/assets/images/icon/${heart}@1x.png`} srcSet={`/assets/images/icon/${heart}@2x.png`} />
        <span  >{heart}</span>
      </Button>
    )
  }
}

export default class ProductDetailHead extends React.Component {
  constructor(props) {
    super(props)
    const {data} = this.props
    this.state = {
      isFocus: data && data.isFocus?data.isFocus:false
    };
  }
  componentWillMount() {
    this.product = new Product()
  }

  componentWillReceiveProps(nextProps) {
    const data = this.props.data || {}
    if(nextProps.data){
      const id = data.id
      if (nextProps.data && nextProps.data.id != id) {
        this.setState({isFocus: nextProps.data.isFocus})
      }
    }
  }
  focus = () => {
    const request = this.state.isFocus
      ? this.product.un_focus
      : this.product.focus
    const ids = [this.props.data.id]
    request(ids).then(res => {
      if (res.success) {
        this.setState({
          isFocus: !this.state.isFocus
        })
      }
    })
  }
  render() {
    const {data} = this.props;
    let name,
      tags = [],
      sunmmary;
    if (data) {
      if (data.typeIdText) {
        tags.push(data.typeIdText)
      }
      data
        .productDto.data.productFieldDtos
        .map(item => {
          if (item.name == "name") {
            name = item.fieldConfigDto.initValue;
          }

          if (item.name == "issuedChannel" || item.name == "investDomain") {
            if (item.fieldConfigDto.initValue) {
              item
                .selectDtos
                .map(select => {
                  if (select.value == item.fieldConfigDto.initValue) {
                    tags.push(select.label);
                  }
                });
            }
          }

          if (item.name == "highlight") {
            sunmmary = item.fieldConfigDto.initValue;
          }
        });
    }

    return (
      <div className={style.header}>
        <div className={style.title}>
          {name || '--'}
          <FocusBtn active={this.state.isFocus} onClick={this.focus}/>
        </div>
        <div className={style.tags}>
          {tags && tags.map((tag, index) => <span key={`tag_${index}`}>
            {tag}
          </span>)}
        </div>
        {sunmmary && sunmmary.trim()?<div className={style.summary}>
          {sunmmary}
        </div>:null}
      </div>
    );
  }
}
