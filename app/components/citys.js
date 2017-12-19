import React, { Component } from "react";
import ReactDOM from "react-dom";
import { TreeSelect, Spin } from "antd";
import citys from "const/citys";
import Promise from "promise";

/**
 * 城市选择控件
 * @class Citys
 * @constructor
 */
class Citys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: citys,
      value: props.defaultValue || props.value || ""
    };
  }
  componentDidMount() {
    this.dom = ReactDOM.findDOMNode(this);
    if (this.props.setCitys) {
      this.props.setCitys.call(this, this);
    }
  }
  onChange(value, text) {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange.call(this, { value, text });
    }
  }
  clear() {
    this.setState({ value: [] });
  }
  loadData(treeNode) {
    const pronviceCode = treeNode.props.eventKey;
    const pronvice = this.findPronvice(pronviceCode);
    if (pronvice.children) {
      return new Promise(resolve => {
        resolve();
      });
    } else {
      return this.loadCitysByPronviceCode(pronviceCode);
    }
  }
  setContainer(node) {
    return this.dom || document.body;
  }
  render() {
    const treeData = this.state.treeData;
    const props = {
      treeData,
      value: this.state.value,
      onChange: ::this.onChange,
      multiple: true,
      treeCheckable: true,
      showCheckedStrategy: TreeSelect.SHOW_CHILD,
      searchPlaceholder: "请选择城市",
      notFoundContent: "没有找到城市",
      getPopupContainer: ::this.setContainer,
      dropdownStyle: "citys-dropdown",
      treeNodeFilterProp: "label",
      style: {
        width: 300,
        position: "relative"
      }
    };
    return (
      <div className="citys">
        <TreeSelect {...props} />
      </div>
    );
  }
}

export default Citys;
