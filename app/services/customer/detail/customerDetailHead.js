import React, { Component } from "react";
import { Button, Icon, Select, message } from "antd";

const { Option } = Select;

import style from "./customerDetail.scss";

import Customer from "model/Customer/";

import Dictionary from "model/dictionary";

import extend from "extend";

import Permission from "components/permission";

import Utils from "utils/index";

class FocusBtn extends Component {
  render() {
    const { active, ...others } = this.props;
    const heart = active ? "已关注" : "加关注";

    return (
      <Button className={style.btnfollow} {...others}>
        <img
          src={`/assets/images/icon/${heart}@1x.png`}
          srcSet={`/assets/images/icon/${heart}@2x.png`}
        />
        <span>{heart}</span>
      </Button>
    );
  }
}

export default class CustomerDetailHead extends Component {
  constructor(props) {
    super(props);
    const { data } = this.props;
    this.state = {
      filters: {},
      data: data,
      isFocus: data && data.focus ? data.focus : false,
      status: data.status
    };
  }
  componentWillMount() {
    this.customer = new Customer();
    this.dictionary = new Dictionary();
  }

  componentDidMount() {
    this.dictionary.gets("dic_customer_status").then(res => {
      if (res.success && res.result) {
        let filters = {};
        res.result.map(item => {
          filters[item.value] = item.selections;
        });

        this.setState({ filters });
      }
    });
  }

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
      request = isFocus ? this.customer.unfocus : this.customer.focus;
    request(ids).then(res => {
      if (res.success) {
        message.success(isFocus ? "取消关注成功" : "关注成功", 0.8);
        this.setState({
          isFocus: !isFocus
        });
      }
    });
  };
  changeStatus = status => {
    const { dic_customer_status } = this.state.filters,
      { id } = this.props.data;
    const statusText = dic_customer_status.filter(
      item => item.value == status
    )[0].label;
    this.customer.update_status({ id, status }).then(res => {
      if (res.success) {
        message.success(`客户有效性变更为${statusText}`, 0.8);
        this.setState({
          status
        });
      }
    });
  };

  render() {
    const { data, mod } = this.props;
    const showFocus = Utils.checkPermission("user.customer.v2.focus");

    const check = (
      <img
        src="/assets/images/customer/完成@1x.png"
        srcSet="/assets/images/customer/完成@1x.png"
      />
    );

    const info = JSON.parse(JSON.stringify(data.info.data));

    const hasCert =
      info.credential &&
      info.credential.type &&
      info.credential.number &&
      (info.credential.front || info.credential.back);

    const hasAsset = info.attachDtos && info.attachDtos.length;

    const { dic_customer_status } = this.state.filters;

    const riskChecked = (
      <img
        className={style.risk_check_icon}
        src={`/assets/images/customer/合规管理-${data.riskText
          ? "已"
          : "未"}认证@1x.png`}
        srcSet={`/assets/images/customer/合规管理-${data.riskText
          ? "已"
          : "未"}认证@2x.png`}
      />
    );

    const ChangeStatus = Permission(
      <Select
        getPopupContainer={() => document.getElementById("customer_header")}
        value={
          this.state.status != undefined && dic_customer_status
            ? this.state.status.toString()
            : null
        }
        style={{
          width: 120
        }}
        onChange={this.changeStatus}
      >
        {dic_customer_status &&
          dic_customer_status.map(item => {
            return <Option key={item.value} value={item.value}>{item.label}</Option>;
          })}
      </Select>
    );

    return (
      <div className={style.header} id="customer_header">
        <div className={style.number}>
          <span>客户编号</span>
          {data.number}
        </div>
        <div className={style.title}>
          {data.name || "--"}
          <span
            style={{
              color: "#999"
            }}
          >
            ({data.mobile})
          </span>
          {showFocus ? (
            <FocusBtn active={this.state.isFocus} onClick={this.focus} />
          ) : null}

          <div
            className={style.risk}
            onClick={e => {
              const newData = extend(
                true,
                {
                  activeKey: "4"
                },
                data
              );
              mod.setState({ data: newData });
            }}
          >
            {data.riskText ? (
              <span className={style.risk_text}>
                <img
                  className={style.risk_check_icon}
                  src="/assets/images/customer/测评@1x.png"
                  srcSet="/assets/images/customer/测评@1x.png"
                />
                {data.riskText}
              </span>
            ) : null}
            <span className={style.checked_list}>
              {riskChecked}
              合规管理>>
            </span>
          </div>
        </div>
        <div className={style.tag_status}>
          <div className={style.tags}>
            {data.tags &&
              data.tags.map((tag, index) => (
                <span key={`tag_${index}`}>{tag.name}</span>
              ))}
          </div>
          <div>
            有效性:
            {Utils.checkPermission("customer.update.status") ? (
              <ChangeStatus auth="customer.update.status" />
            ) : (
              data.statusText
            )}
          </div>
        </div>
      </div>
    );
  }
}
