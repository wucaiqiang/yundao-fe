import React, { Component } from "react";
import { Button, Icon, Select } from "antd";

import Dictionary from "model/dictionary";

import style from "./index.scss";

import Fund from "model/Assets/fund";

class FocusBtn extends Component {
  render() {
    const { active, ...others } = this.props;
    const heart = active ? "已关注" : "加关注";
    const icoType = active ? "heart" : "heart-o";

    return (
      <Button className={style.focus} {...others}>
        <Icon className={style.focus_ico} type={icoType} />
        <span>{heart}</span>
      </Button>
    );
  }
}

export default class HeadInfo extends React.Component {
  constructor(props) {
    super(props);
    const { data } = this.props;

    this.issuedStatus = data.issuedStatus;
    this.issuedStatusText = data.issuedStatusText;

    this.state = {
      isEdit: false,
      isFocus: data && data.isFocus ? data.isFocus : false
    };
  }
  componentWillMount() {
    this.fund = new Fund();
    this.dictionary = new Dictionary();

    this.getDictionary();
  }

  componentWillReceiveProps(nextProps) {
    const data = this.props.data || {};
    if (nextProps.data) {
      const id = data.id;
      if (nextProps.data && nextProps.data.id != id) {
        this.setState({ isFocus: nextProps.data.isFocus });

        this.issuedStatus = nextProps.data.issuedStatus;
        this.issuedStatusText = nextProps.data.issuedStatusText;
      }
    }
  }

  getDictionary() {
    this.dictionary.gets("dic_fund_issued_status").then(res => {
      if (res.success && res.result) {
        let state = this.state;
        res.result.map(item => {
          state[item.value] = item.selections;
        });

        this.setState({ ...state });
      }
    });
  }

  focus = () => {
    const request = this.state.isFocus ? this.fund.unfocus : this.fund.focus;
    const ids = this.props.data.id;
    request(ids).then(res => {
      if (res.success) {
        this.setState({
          isFocus: !this.state.isFocus
        });
      }
    });
  };

  handleStatusSave = () => {
    const { data, mod } = this.props;

    let postData = {
      id: data.id,
      issuedStatus: this.issuedStatus
    };

    this.fund.changeIssuedStatus(postData).then(res => {
      if (res.success) {
        mod.loadData && mod.loadData();
        mod.refreshRootList && mod.refreshRootList();

        this.setState({ isEdit: false });
      }
    });
  };
  render() {
    const { isEdit, dic_fund_issued_status } = this.state;

    const icons = [];
    const { data } = this.props;
    const { editPermission } = data.fundDto.permission;

    let name,
      tags = [],
      sunmmary;

    if (data) {
      if (data.typeIdText) {
        tags.push(data.typeIdText);
      }
      data.fundDto.data.fundFieldDtos.map(item => {
        if (item.name == "name") {
          name = item.fieldConfigDto.initValue;
        }

        if (item.name == "issuedChannel" || item.name == "investDomain") {
          if (item.fieldConfigDto.initValue) {
            item.selectDtos.map(select => {
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

    if (isEdit) {
      icons.push(
        <img
          key="action1"
          className="anticon"
          src="/assets/images/icon/取消@1x.png"
          onClick={e => {
            this.setState({ isEdit: false });
          }}
        />
      );
      icons.push(
        <img
          key="action2"
          className="anticon"
          src="/assets/images/icon/确认@1x.png"
          onClick={this.handleStatusSave}
        />
      );
    } else {
      //是否有编辑权限
      if (editPermission) {
        icons.push(
          <img
            key="action3"
            className="anticon"
            src="/assets/images/icon/编辑@1x.png"
            onClick={e => {
              this.setState({ isEdit: true });
            }}
          />
        );
      }
    }

    return (
      <div className={style.header} ref={ref => (this.container = ref)}>
        <div className={style.title}>
          {name}
          <FocusBtn active={this.state.isFocus} onClick={this.focus} />
          {isEdit ? (
            <Select
              getPopupContainer={() => this.container}
              size="large"
              placeholder="请选择"
              defaultValue={"" + data.issuedStatus}
              onSelect={(value, option) => {
                this.issuedStatus = value;
                this.issuedStatusText = option.props.children;
              }}
            >
              {dic_fund_issued_status &&
                dic_fund_issued_status.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  );
                })}
            </Select>
          ) : (
            <span className={style.status}>{this.issuedStatusText}</span>
          )}
          {editPermission ? icons : null}
        </div>
        {data.productId ? (
          <div className={style.product}>
            关联财富管理的产品：<a
              className={style.name}
              href={`/product/detail/${data.productId}`}
              target="_blank"
            >
              {data.productName}
            </a>
          </div>
        ) : null}
        <div className={style.tags}>
          {tags &&
            tags.map((tag, index) => <span key={`tag_${index}`}>{tag}</span>)}
        </div>
        {sunmmary ? <div className={style.summary}>{sunmmary}</div> : null}
      </div>
    );
  }
}
