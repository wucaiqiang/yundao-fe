import React, { Component } from "react";
import { Cascader, Spin } from "antd";
import citys from "const/citys";

/**
 * 城市选择控件
 * @class City
 * @constructor
 */
export default class City extends Component {
  constructor() {
    super();
    this.setState;
  }
  setValue(provinceCode, cityCode) {
    if (!provinceCode) {
      this.refs.cascader.setState({ value: [] });
    } else {
      this.refs.cascader.setState({ value: [provinceCode, cityCode] });
    }
  }
  onChange(value, selectedOptions) {
    if (this.props.onChooseProvince && value.length == 1) {
      this.props.onChooseProvince.apply(this, value);
    }
    if (this.props.onChooseCity && value.length == 2) {
      this.props.onChooseCity.apply(this, value);
    }
  }
  render() {
    return (
      <Cascader
        options={citys}
        placeholder="请选择地区"
        onChange={::this.onChange}
        changeOnSelect
        ref="cascader"
      />
    );
  }
}
