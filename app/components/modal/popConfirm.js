import React, { Component } from "react";
import { Popconfirm } from "antd";

export default class Popup extends Component {
  state = {
    visible: false
  };
  constructor(props) {
    super(props);
  }
  handleVisible(visible) {
    this.setState({ visible });
  }
  render() {
    const { onConfirm, onCancel, ...others } = this.props;
    return (
      <Popconfirm
        {...others}
        visible={this.state.visible}
        onConfirm={e => {
          this.setState({
            visible: false
          });
          onConfirm && onConfirm();
        }}
        onCancel={e => {
          this.setState({
            visible: false
          });
          onCancel && onCancel();
        }}
      />
    );
  }
}
