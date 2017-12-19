import React, { Component } from "react";
import RenderTo from "components/renderTo";

class FullContentWindow extends Component {
  handleClose() {
    if (this.props.onClose) {
      this.props.onClose.call(this);
    }
  }
  render() {
    let cls;

    cls = ["full-content-window-wrap"];
    if (this.props.visible) {
      cls.push("full-content-window-open");
    }
    cls = cls.join(" ");
    return (
      <RenderTo ref="renderTo">
        {this.props.visible &&
          <div className={cls}>
            <div className="full-content-window-mask" />
            <div className="full-content-window">
              {this.props.children}
            </div>
            <a
              className="full-content-window-close icon-close"
              href="javascript:;"
              onClick={() => this.handleClose()}
            />
          </div>}
      </RenderTo>
    );
  }
}

export default FullContentWindow;
