import React, { Component } from "react";

import PropTypes from "prop-types";

import {
  Layout,
  Form,
  Tabs,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Icon,
  Button,
  message
} from "antd";

import Base from "../main/Base";

import GM from "../../lib/gridManager.js";

import style from "./multipleForm.scss";

import extend from "extend";

import GridBase from "../../base/gridMod";
const GridManager = GM.GridManager;

let uuid = 0;

class MultipleForm extends GridBase {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    canExpand: PropTypes.bool,
    maxCol: PropTypes.number,
    maxColChild: PropTypes.number
  };

  static defaultProps = {
    className: "multipleForm",
    canExpand: true,
    maxCol: 20,
    maxColChild: 20
  };

  constructor(props) {
    super(props);
    this.enterAnim = [
      {
        opacity: 0,
        x: 30,
        backgroundColor: "#fffeee",
        duration: 0
      },
      {
        height: 0,
        duration: 200,
        type: "from",
        delay: 250,
        ease: "easeOutQuad",
        onComplete: this.onEnd
      },
      {
        opacity: 1,
        x: 0,
        duration: 250,
        ease: "easeOutQuad"
      },
      {
        delay: 1000,
        backgroundColor: "#fff"
      }
    ];
    this.leaveAnim = [
      {
        duration: 250,
        opacity: 0
      },
      {
        height: 0,
        duration: 200,
        ease: "easeOutQuad"
      }
    ];
  }
  state = {
    data: []
  };
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
  }
  addCol = () => {
    let data = this.state.data;
    console.log(this.state);
    if (data.length >= this.props.maxCol) {
      message.warn(`最多只允许添加${this.props.maxCol}记录`);
      return false;
    }
    let newKey = data.length == 0 ? 0 : Number(data[data.length - 1].key) + 1;
    data.push({
      id: null,
      key: newKey,
      childs: [
        {
          id: null,
          key: newKey + "_0"
        }
      ]
    });
    this.setState({ data });
  };

  addColChild = key => {
    //获取
    let data = this.state.data;
    data.map(item => {
      if (item.key == key) {
        if (!item.childs) {
          item.childs = [];
        }

        if (item.childs.length >= this.props.maxColChild) {
          message.warn(`最多只允许添加${this.props.maxColChild}记录`);
          return false;
        }
        //判断是否有子节点，没有则key = 0,否则取最后一个子节点的key +1
        let newKey =
          item.childs.length == 0
            ? 0
            : Number(item.childs[item.childs.length - 1].key.split("_")[1]) + 1;
        item.childs.push({
          id: null,
          key: item.key + "_" + newKey
        });
      }
    });
    this.setState({ data });
  };
  removeColChild = key => {
    console.log(key);
    //去除某个分支
    let data = this.state.data;
    data.map(item => {
      const childs =
        item.childs &&
        item.childs.length &&
        item.childs.filter(child => child.key != key);
      item.childs = childs;
      return item;
    });

    this.setState({ data });
  };
  removeCol = keys => {
    //去除子分支
    let data = this.state.data;
    data = data.filter(item => keys.indexOf(item.key) == -1);
    this.setState({ data, selectRowsCount: 0, selectIds: [] });
    // state.selectIds = selectData.selectIds;
    // state.selectRowsCount = selectData.selectRowsCount;
    // state.selectRowsData = selectData.selectRowsData;
    // state = extend(true, {}, state);
    // this.setState(state);
  };

  delete = () => {
    const selectRowsData = this.state.selectRowsData;
    console.log(selectRowsData);
    const keys = selectRowsData.map(row => row.key);
    this.removeCol(keys);
    // console.log(ids);
    // ids.map(id=>{
    //     this.removeCol(id)
    // })
  };

  render() {
    const { title, showTitle = true } = this.props;

    return (
      <div>
        <GridManager
          disabledAutoLoad={true}
          columns={this.getColumns()}
          noRowSelection={true}
          dataSource={this.state.data}
          gridWrapClassName={`grid-panel auto-width-grid`}
          className={`multipleForm-table`}
          mod={this}
          rowKey={"key"}
          getBodyWrapper={this.getBodyWrapper}
          pagination={false}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          {showTitle ? (
            <div className={`vant-filter-bar clearfix`}>
              <div className="header">
                <div className="title">
                  <p>{title}</p>
                </div>
              </div>
              <div className={this.getFloatToolsBarCls()}>
                已选择
                <span className="count">{this.state.selectRowsCount}</span>
                项
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.delete}>
                  <Icon type="delete" />删除
                </a>
              </div>
            </div>
          ) : null}
        </GridManager>
        {this.props.canExpand && this.state.data.length < 1 ? (
          <div className={style.btns}>
            <Button icon={"plus"} onClick={this.addCol}>
              {title ? `新增${title}` : "新增规则"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default MultipleForm;
