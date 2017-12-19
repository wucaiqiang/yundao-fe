import React, { Component } from "react";
import { Button, Icon, message } from "antd";

import Assets from "model/Assets/index";

import style from "./index.scss";

class FocusBtn extends Component {
  render() {
    const { active, ...others } = this.props;
    const focusText = active ? "已关注" : "加关注";
    const icoType = active ? "heart" : "heart-o";

    return (
      <Button className={style.focus} {...others}>
        <Icon className={style.focus_ico} type={icoType} />
        <span>{focusText}</span>
      </Button>
    );
  }
}

export default class DetailHead extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false
    };
  }
  componentWillMount() {
    this.assets = new Assets();

    let { projectData: { data } } = this.props;

    this.setState({ isFocus: data.isFocused });
  }

  handleFocus = () => {
    const { isFocus } = this.state,
      { id } = this.props.projectData,
      request = isFocus ? this.assets.unfocus : this.assets.focus;

    request(id).then(res => {
      if (res.success) {
        message.success(isFocus ? "取消关注成功" : "关注成功", 0.8);
        this.setState({
          isFocus: !isFocus
        });
      }
    });
  };
  render() {
    let { projectData: { data, permission } } = this.props;

    if (!data) return null;

    return (
      <div className={style.header}>
        <div className={style.title}>
          <img
            className={style.title_ico}
            src="/assets/images/project/产品@1x.png"
          />
          <span className={style.title_name}>{data.name}</span>
          {permission.editPermission ? (
            <FocusBtn active={this.state.isFocus} onClick={this.handleFocus} />
          ) : null}
        </div>
        <div className={style.summary}>
          <div className={style.summary_item}>
            <label className={style.summary_item_label}>行业领域</label>
            <p className={style.summary_item_value}>{data.industryText}</p>
          </div>
          <div className={style.summary_item}>
            <label className={style.summary_item_label}>项目状态</label>
            <p className={style.summary_item_value}>{data.statusText}</p>
          </div>
          <div className={style.summary_item}>
            <label className={style.summary_item_label}>优先级</label>
            <p className={style.summary_item_value}>{data.priorityText}</p>
          </div>
          <div className={style.summary_item}>
            <label className={style.summary_item_label}>当前轮次估值</label>
            <p className={style.summary_item_value}>
              {data.valuation ? `${data.valuation}万` : null}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
