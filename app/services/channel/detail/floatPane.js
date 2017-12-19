import React from "react";
import { Spin, message } from "antd";

import FloatPanelBase from "base/floatPanelBase";

import Channel from "model/Channel/";

let ChannelDetail = null;

export default class ChannelFloatPane extends FloatPanelBase {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
    this.channel = new Channel();
  }

  show = data => {
    const that = this;
    if (!this.state.showOnce) {
      require.ensure(["./index"], function(require) {
        ChannelDetail = require("./index").default;
        that.setState(
          {
            showOnce: true
          },
          () => {
            that.setVisible(data);
          }
        );
      });
    } else {
      this.setVisible(data);
    }
  };

  setVisible = data => {
    this.visible();
    this.setState({ loading: true, data }, () => {
      this.loadData();
    });
  };

  loadData = () => {
    const { id } = this.state.data;

    this.channel.get(id).then(res => {
      this.setState({
        loading: false
      });
      if (res.success) {
        let data = res.result;
        data.id = id;
        this.setState({
          data,
          id
        });
      }
    });
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  reloading = () => {
    this.setState(
      {
        loading: true
      },
      () => {
        this.loadData();
      }
    );
  };

  refreshGrid = () => {
    this.props.reload && this.props.reload();
  };

  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap");
    if (this.state.visible) {
      cls.push("open");
    }
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }
  render() {
    return (
      <div className={this.getDetailClass()}>
        {this.state.loading ? (
          <Spin />
        ) : this.state.data ? (
          <ChannelDetail
            ref={ref => {
              this.channelDetail = ref;
            }}
            mod={this}
            data={this.state.data}
          />
        ) : null}
      </div>
    );
  }
}
