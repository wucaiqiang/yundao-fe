import React, { Component } from "react";
import {
  Icon,
  Menu,
  Dropdown,
  Row,
  Col,
  Button,
  Badge,
  Input,
  Tag,
  Tabs,
  Select,
  Spin,
  DatePicker,
  Form,
  Modal,
  Upload,
  Checkbox,
  Radio,
  Carousel,
  Cascader,
  message
} from "antd";
import MessageFloat from "services/message/messageFloat";
import Message from "model/Message/";

import RenderTo from "components/renderTo";

class Mod extends Component {
  constructor() {
    super();
    this.state = {
      unReadCount: [],
      unReadCountAmount: 0,
      showMessageOnce:false,
    };
    this.message = new Message();
  }
  updateBadge = count => {
    // const amount = Number(this.state.unReadCountAmount) + Number(count)
    // console.log('amount',amount)
    const { unReadCount } = this.state;
    unReadCount[0] = count;
    this.setState({ unReadCountAmount: count, unReadCount });
  };
  componentWillMount() {
    // this.update_unread_count();
    window.update_message = this.update_unread_count;
  }
  update_unread_count = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      unReadCountAmount: 0
    });
    var count = [];
    this.message.get_unread_count().then(res => {
      if (!res.result) return;
      count[0] = res.result.taskCount;
      count[1] = res.result.messageCount;
      this.setState({ unReadCount: count });
      if (count[0]) {
        this.updateBadge(count[0]);
      }
    });
  };
  componentWillUnmount() {
    this.mounted = false;
  }
  componentDidMount() {
    this.mounted = true;
  }
  toggleMessage=()=> {
    const that = this
    if(!this.state.showMessageOnce){
      this.setState({
        showMessageOnce:true
      },()=>{
        this.messageFloat.toggle();
       
      })
    }else{
      this.messageFloat.toggle();
    }
  };
  render() {
    
    return (
      <div
        ref="notification"
        role="floatPane"
        onClick={this.toggleMessage}
        style={{
          paddingRight: 20,
          cursor: "pointer"
        }}
      >
        <Badge
          dot={
            this.state.unReadCount[0] == 0 && this.state.unReadCount[1] > 0 ? (
              true
            ) : (
              false
            )
          }
          count={
            this.state.unReadCountAmount > 99 ? (
              "99+"
            ) : (
              Math.max(0, this.state.unReadCountAmount)
            )
          }
        >
          <img src="/assets/images/menu/消息@1x.png" />
        </Badge>
        {this.state.showMessageOnce?<RenderTo to={'app'}>
          <MessageFloat
            updateBadge={this.updateBadge}
            update_unReadCount={unReadCount => {
              this.setState({
                unReadCount
              });
            }}
            ref={ref=>{
              if(ref){
                this.messageFloat = ref
              }
            }}
            dataSource={{
              unReadCount: this.state.unReadCount
            }}
          />
        </RenderTo>:null}
      </div>
    );
  }
}

export default Mod;
