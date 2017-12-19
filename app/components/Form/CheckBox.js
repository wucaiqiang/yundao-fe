import React, { Component } from "react";
import { CheckBox } from "antd";

export default class CheckBox extends React.Component {
  render() {
    return (
      <Checkbox checked={this.props.value} onChange={this.props.onChange}>
        {this.props.children}
      </Checkbox>
    );
  }
}
