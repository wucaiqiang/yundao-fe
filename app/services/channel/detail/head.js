import React, { Component } from "react";
import { Button, Icon, Select, message } from "antd";

const { Option } = Select;

import style from "./index.scss";

import Channel from "model/Channel/";

import extend from "extend";

import Permission from "components/permission";

import Utils from "utils/index";

class FocusButton extends Component {
  render() {
    const { active, ...others } = this.props;
    const heart = active ? "已关注" : "加关注";
    const icoType = active ? "heart" : "heart-o";

    return (
      <Button className={style.btnfollow} {...others}>
      <Icon className={style.focus_ico} type={icoType} />
        <span>{heart}</span>
      </Button>
    );
  }
}

export default class ChannelDetailHead extends Component {
  constructor(props) {
    super(props);
    const { data } = this.props;
    this.state = {
      data: data,
      isFocus: data && data.focus ? data.focus : false,
      status: data.status
    };
  }
  componentWillMount() {
    this.channel = new Channel();
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const data = this.props.data || {};
    if (nextProps.data) {
      const id = data.id;
      if (nextProps.data && id && id != nextProps.data.id) {
        this.setState({
          isFocus: nextProps.data.focus,
          status: nextProps.data.status
        });
      }
    }
  }
  focus = () => {
    const { isFocus } = this.state,
      { id } = this.props.data,
      ids = isFocus ? id : [id],
      request = isFocus ? this.Channel.unfocus : this.customer.focus;

    request(ids).then(res => {
      if (res.success) {
        message.success(isFocus ? "取消关注成功" : "关注成功", 0.8);
        this.setState({
          isFocus: !isFocus
        });
      }
    });
  };

  render() {
    const { data, mod } = this.props;

    const showFocus = Utils.checkPermission("user.customer.v2.focus");

    return (
      <div className={style.header}>
        <div className={style.number}>
          <span>渠道编号</span>
          {data.number}
        </div>
        <div className={style.title}>
          {data.name}
          {showFocus ? (
            <FocusButton active={this.state.isFocus} onClick={this.focus} />
          ) : null}
        </div>
      </div>
    );
  }
}
