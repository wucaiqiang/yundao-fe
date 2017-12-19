import React, { Component } from "react";
import { Select, Checkbox, DatePicker } from "antd";
import QueueAnim from "rc-queue-anim";

const Option = Select.Option;

class SingleCheckboxGroup extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.defaultValue || props.value || "" };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  onChange(e) {
    let value;

    value = e.target.value;
    if (this.state.value != value) {
      this.setState({ value });
      if (this.props.onChange) {
        this.props.onChange.call(this, value);
      }
    }
  }
  render() {
    return (
      <div>
        {this.props.options.map(option => {
          return (
            <Checkbox
              value={option.value}
              checked={this.state.value == option.value}
              onChange={::this.onChange}
            >
              {option.label}
            </Checkbox>
          );
        })}
      </div>
    );
  }
}

export default SingleCheckboxGroup;
