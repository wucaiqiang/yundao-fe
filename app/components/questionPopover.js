import React, {Component} from "react";

import PropTypes from "prop-types";

import {Popover} from 'antd'

const icon_question = "/assets/images/icon/问号";

export default class Permission extends Component {
  constructor(props) {
    super(props);
  }

  render() {
      const {text} = this.props
    return  (
        <Popover placement="topLeft" content={text} arrowPointAtCenter>
          <img
            src={icon_question + "@1x.png"}
            srcSet={icon_question + "@2x.png 2x"}
          />
        </Popover>
        
      );
  }
};

