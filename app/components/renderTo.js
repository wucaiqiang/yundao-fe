import React, { Component } from "react";
import ReactDOM from "react-dom";

class RenderTo extends Component {
  appendMaskIntoDoc() {
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      <div>{this.props.children}</div>,
      this.container
    );
  }

  componentDidMount() {
    let to;

    to = this.props.to;

    if (to) {
      if (typeof to == "string") {
        to = document.getElementById(to);
      }
    } else {
      to = document.body;
    }

    this.to = to;

    this.container = document.createElement("div");
    to.appendChild(this.container);
    console.log('append child')
    this.appendMaskIntoDoc();
  }

  componentDidUpdate() {
    this.appendMaskIntoDoc();
  }

  componentWillUnmount() {
    this.destory();
  }

  destory() {
    this.to.removeChild(this.container);
  }

  render() {
    return null;
  }
}
export default RenderTo;
