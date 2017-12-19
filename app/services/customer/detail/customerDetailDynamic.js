import React, { Component } from "react";
import { Button, Icon, Radio, Pagination, Spin } from "antd";

import Customer from "model/Customer/";
import Utils from "utils/";

import style from "./customerDetail.scss";

export default class CustomerDetailDynamic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      firstType: "",
      currentPage: 1,
      pageSize: 10,
      datas: null,
      totalCount: 0
    };
  }
  componentWillMount() {
    this.customer = new Customer();
  }
  componentDidMount() {
    let customerId = this.props.customerId;

    this.customerId = customerId;
    this.getData(customerId);
  }
  componentWillReceiveProps(nextProps) {
    const customerId = this.props.customerId;
    if (nextProps.customerId !== customerId) {
      this.customerId = nextProps.customerId;
      this.getData(nextProps.customerId);
    }
  }
  getData(customerId, currentPage = 1, pageSize = 10) {
    if (!customerId) return;

    this.setState({ loading: true });

    let params = {
      currentPage,
      pageSize,
      customerId,
      firstType: this.state.firstType
    };

    this.customer.gets_dynamic(params).then(res => {
      this.setState({ loading: false });

      if (res.success) {
        let { currentPage, pageSize, datas, totalCount } = res.result;

        this.setState({ currentPage, pageSize, datas, totalCount });
      }
    });
  }
  reload() {
    this.getData(this.customerId, this.state.currentPage);
  }
  onChange = (currentPage,pageSize) => {
    console.log('currentPage,pageSize',currentPage,pageSize)
    this.getData(this.customerId, currentPage,pageSize);
  };
  handleTabChange = e => {
    this.setState({ firstType: e.target.value }, () => {
      this.getData(this.customerId, this.state.currentPage);
    });
  };
  render() {
    let { loading, firstType, currentPage, pageSize, datas, totalCount } = this.state;
    return (
      <div className={style.dynamic}>
        <Spin spinning={loading}>
          <div className={style.dynamic_tab}>
            <Radio.Group value={firstType} onChange={this.handleTabChange}>
              <Radio.Button value={""}>全部</Radio.Button>
              <Radio.Button value={"1"}>客户行为</Radio.Button>
              <Radio.Button value={"2"}>服务轨迹</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            {datas &&
              datas.map(row => {
                return (
                  <div className={style.dynamic_item} key={row.id}>
                    <div className={style.dynamic_item_time}>
                      <span>
                        {row.createDate &&
                          Utils.formatDate(row.createDate, "YYYY-MM-DD HH:mm")}
                      </span>
                    </div>
                    <div className={style.dynamic_item_body}>
                      <pre>{row.feedContent}</pre>
                    </div>
                  </div>
                );
              })}
          </div>
          {totalCount > 0 ? (
            <Pagination
              className={style.pagination}
              showQuickJumper
              showSizeChanger
              current={currentPage}
              pageSize={pageSize}
              total={totalCount}
              showTotal={total => {
                return `共${total}条`;
              }}
              onShowSizeChange={this.onChange}
              onChange={this.onChange}
            />
          ) : (
            <div className={style.dynamic_empty}>暂无动态</div>
          )}
        </Spin>
      </div>
    );
  }
}
