import React, { Component } from "react";
import { Input } from "antd";
class ViewInput extends Input {
  render() {
    const { isEdit, ...others } = this.props;

    return isEdit ? <Input {...others} /> : <span>{this.props.value}</span>;
  }
}

export default ViewInput;
