import React, { Component } from "react";
import { Select } from "antd";
import extend from "extend";
import ajax from "../lib/ajax";

const Option = Select.Option;

class Combobox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
  }
  handleChange(...args) {
    let data;

    data = {};
    data[this.props.searchParamsName] = args[0];
    if (this.props.url) {
      ajax.get(this.props.url, data).then(data => {
        if (this.props.filter) {
          data = this.props.filter.call(this, data);
        }
        this.setOptions(data);
      });
    }
  }
  setOptions(data) {
    data = data.map(d => {
      return (
        <Option key={d.value} value={d.value} source={d}>
          {d.text}
        </Option>
      );
    });
    this.setState({ options: data });
  }
  render() {
    let props, onChange;

    props = extend(
      {
        filterOption: false,
        dropdownMatchSelectWidth: false
      },
      this.props
    );
    onChange = props.onChange;
    props.onChange = (...args) => {
      this.handleChange(...args);
      if (onChange) {
        onChange(...args);
      }
    };
    return (
      <Select combobox {...props}>
        {this.state.options}
      </Select>
    );
  }
}
export default Combobox;
