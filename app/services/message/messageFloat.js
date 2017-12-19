import React, { Component } from "react";
import {
  Icon,
  Affix,
  Menu,
  Dropdown,
  Button,
  Input,
  Tabs,
  Select,
  message,
  Badge
} from "antd";
import QueueAnim from "rc-queue-anim";
import Grid from "components/grid";

import Message from "model/Message/";

import FloatPanelBase from "base/floatPanelBase";

import "./messageFloat.scss";

import moment from "moment";

const TabPane = Tabs.TabPane;
const Option = Select.Option;

let prevScroll = 0;

class MessageFloat extends FloatPanelBase {
  state = {
    className: "float-detail-wrap",
    visible: false,
    tab: 0,
    pageSize: 20
  };
  data = [
    {
      isLoading: false,
      currentPage: 0,
      datas: [],
      readMessages: [],
      noData: false,
      title: "待办",
      noMoreData: false,
      readCount: 0
    },
    {
      isLoading: false,
      currentPage: 0,
      datas: [],
      readMessages: [],
      noData: false,
      title: "通知",
      noMoreData: false,
      readCount: 0
    }
  ];

  componentWillMount() {
    this.message = new Message();
    this.moreData(this.state.tab);
    const { dataSource } = this.props;
    if (dataSource.unReadCount) {
      if (dataSource.unReadCount[1] && dataSource.unReadCount[1] > 0) {
        this.setState({ showBadge: true,dataSource });
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded
    // render
    if (nextProps.dataSource !== this.state.dataSource) {
      const { dataSource } = nextProps;
      let showBadge = false;
      if (dataSource.unReadCount) {
        if (dataSource.unReadCount[1] && dataSource.unReadCount[1] > 0) {
          showBadge = true;
        }
      }
      this.setState({ dataSource: dataSource, showBadge });
    }
  }

  componentDidMount() {}
  componentDidUpdate() {}
  componentWillUpdateMount() {}

  createSleepPromise(sleep) {
    let sleepPromise;

    sleepPromise = new Promise((resolve, reject) => {
      if (this.state.visible) {
        resolve();
      } else {
        setTimeout(() => {
          resolve();
        }, sleep);
      }
    });
    return sleepPromise;
  }

  show() {
    this.visible()
  }
  toggle() {
    this.state.visible?this.hide():this.visible()
  }
  // hide = () => {
  //   // const readCount = this.setMessageRead()
  //   // this
  //   //   .props
  //   //   .updateBadge(-readCount)
  //   this.setState({ visible: false });
  // };

  setMessageRead(data) {
    // let messagesId = []
    // this
    //   .data
    //   .map((val, index) => {
    //     val.readMessages && val
    //       .readMessages
    //       .map(msg => {
    //         messagesId.push(msg.id)
    //         msg.readStatus = 2
    //         this.data[index].readCount++
    //       })
    //     val.readMessages = []
    //   })
    data.readStatus = 2;
    data.id &&
      this.message.read([data.id]).then(() => {
        this.setState({ tab: this.state.tab });
      });
    if (data.pcAction) {
      window.open(data.pcAction, "_blank");
    }
    if (this.state.tab == 0) {
      const count = Math.max(this.props.dataSource.unReadCount[0] - 1, 0);
      this.props.updateBadge(count);
    }
  }
  getDetailClass() {
    let cls, detail;

    cls = [];
    cls.push("float-detail-wrap float-message-detail-wrap");
    if (this.state.visible) {
      cls.push("open");
    }
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }
  handleChangeTags=(key) =>{
    key = parseInt(key);
    const that = this
    this.loadTabPanelByKey(key);
    // setTimeout(() => {
    //   that.loadTabPanelByKey(key);
    // });
  }
  loadTabPanelByKey=(key) =>{
    if (key == 1) {
      this.setState({ showBadge: false });
      const { unReadCount } = this.state.dataSource;
      unReadCount[1] = 0;
      this.props.update_unReadCount(unReadCount);
    }
    if (key == this.state.key) return;
    this.setState({ tab: key });
    const data = this.data[key];
    if ((data.datas.length == 0 && !data.isLoading) || data.noData) {
      this.moreData(key);
    }
  }
  onScroll = e => {
    const tab = this.state.tab;
    const dom = this.refs["tabContainer_" + tab];
    if (
      dom.offsetHeight + dom.scrollTop > dom.scrollHeight - 30 &&
      dom.scrollTop > prevScroll
    ) {
      this.moreData(tab);
    }
    prevScroll = dom.scrollTop;
  };
  moreData(tab) {
    const data = this.data[tab];
    let { startDate, endDate } = data;
    if (data.isLoading || data.noMoreData) return;
    data.isLoading = true;
    if (tab == this.state.tab) {
      this.setState({ tab });
      data.noData = false;
    }
    const config = {
      firstType: tab + 1,
      currentPage: data.currentPage + 1,
      pageSize: this.state.pageSize
    };
    this.message.get_page(config).then(res => {
      data.isLoading = false;
      if (!res.success || !res.result.datas || !res.result.datas.length) {
        //message.error('没有可用的数据')
        if (data.currentPage == 0) {
          data.noData = true;
          data.noMoreData = true;
        }
        if (tab == this.state.tab) {
          this.setState({ tab });
        }
        return;
      }
      if (
        (res.success && res.result.totalPage == 0) ||
        res.result.totalPage == res.result.currentPage
      ) {
        data.noMoreData = true;
      }
      let datas = res.result.datas;
      if (data.currentPage && res.result.currentPage > data.currentPage) {
        datas = this.data[tab]["datas"].concat(datas);
      }
      data.currentPage = res.result.currentPage;
      this.updateData(tab, datas);
    });
  }
  updateData(tab = 0, datas = []) {
    this.data[tab]["datas"] = datas;
    if (tab == this.state.tab) {
      this.setState({ tab });
    }
  }
  renderList(datas) {
    const listItem = datas.length
      ? datas.map((data, index) => {
          return (
            <li
              className={data.readStatus == 1 ? "active" : ""}
              key={index}
              onClick={e => {
                this.setMessageRead(data);
              }}
            >
              <div className="hd">
                <span className="title">
                  [{data.twoTypeText}]{data.title}
                </span>
                <span className="fr date">
                  {data.createDate
                    ? moment(data.createDate).format("YYYY-MM-DD HH:mm")
                    : null}
                </span>
              </div>
              <div
                className="bd"
                dangerouslySetInnerHTML={{
                  __html: data.messageContent || "--"
                }}
              />
            </li>
          );
        })
      : null;
    return listItem;
  }

  render() {
    return (
      <div id="messageFloat">
        <div className="vant-panel">
          <div className="grid-panel">
            <div className={this.getDetailClass()}>
              <div className="float-detail">
                <div className="float-detail-hd">
                  <span className="icon icon-notification-w" />消息
                  <a className="fr" onClick={this.hide}>
                    <Icon type="cross" />
                  </a>
                </div>
                <div className="float-detail-bd">
                  <div className="float-detail-main-wrap">
                    <div className="float-detail-main">
                      <Tabs
                        defaultActiveKey="0"
                        ref="mainTabs"
                        onChange={key => this.handleChangeTags(key)}
                      >
                        {this.data.map((val, index) => {
                          let tab = <Badge dot={this.state.show} />;
                          if (index == 0) {
                            tab = (
                              <Badge
                                count={Math.max(
                                  0,
                                  this.props.dataSource.unReadCount[index] -
                                    this.data[index].readCount || 0
                                )}
                              >
                                {val.title}
                              </Badge>
                            );
                          }
                          if (index == 1) {
                            tab = (
                              <Badge dot={this.state.showBadge}>
                                {val.title}
                              </Badge>
                            );
                          }
                          return (
                            <TabPane
                              tab={tab}
                              ref={`tabContainer_${index + 1}`}
                              key={index}
                              onScroll={this.onScroll}
                            >
                              <ul className={"messageList"}>
                                {val.noData ? (
                                  <div className={"empty"}>
                                    <div onClick={() => this.moreData(index)}>
                                      暂无最新{val.title}
                                    </div>
                                  </div>
                                ) : val.datas.length ? (
                                  this.renderList(val.datas)
                                ) : (
                                  <div
                                    style={{
                                      textAlign: "center"
                                    }}
                                  >
                                    <Icon type={"loading"} size={"18px"} />
                                  </div>
                                )}
                              </ul>
                              {val.noMoreData ? null : val.datas.length ? (
                                <div
                                  style={{
                                    textAlign: "center",
                                    margin: "20px 0"
                                  }}
                                >
                                  <Button
                                    icon={val.isLoading ? "loading" : ""}
                                    disabled={val.isLoading}
                                    onClick={() => {
                                      this.moreData(index);
                                    }}
                                  >
                                    {val.isLoading ? "正在加载中..." : "点击加载更多"}
                                  </Button>
                                </div>
                              ) : null}
                            </TabPane>
                          );
                        })}
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MessageFloat;
