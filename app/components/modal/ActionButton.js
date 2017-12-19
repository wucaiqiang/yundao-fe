import React from "react";
import ReactDOM from "react-dom";
import { Button } from "antd";

export default class ActionButton extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    if (this.props.autoFocus) {
      var $this = ReactDOM.findDOMNode(this);
      this.timeoutId = setTimeout(function() {
        return $this.focus();
      });
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }
  onClick = () => {
    const { actionFn, closeModal } = this.props;

    if (actionFn) {
      var ret = void 0;
      if (actionFn.length) {
        ret = actionFn(closeModal);
      } else {
        ret = actionFn();
        if (!ret) {
          closeModal();
        }
      }
      if (ret && ret.then) {
        this.setState({ loading: true });
        ret.then(
          function() {
            // It's unnecessary to set loading=false, for the Modal will be unmounted after close.
            // this.setState({ loading: false });
            closeModal.apply(undefined, arguments);
          },
          function() {
            // See: https://github.com/ant-design/ant-design/issues/6183
            this.setState({ loading: false });
          }
        );
      }
    } else {
      closeModal();
    }
  };
  render() {
    const { type, children } = this.props;
    const { loading } = this.state.loading;

    return (
      <Button type={type} loading={loading} size="large" onClick={this.onClick}>
        {children}
      </Button>
    );
  }
}
