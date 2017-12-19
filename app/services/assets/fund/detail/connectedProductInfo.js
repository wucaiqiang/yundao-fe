import React, { Component } from "react";
import ReactDOM from "react-dom";

import { Button, message, Table, Spin } from "antd";

import Base from "components/main/Base";

import ImportProductModal from "../../importProductModal";

import Fund from "model/Assets/fund";

import style from "./tabs.scss";

export default class TeamInfo extends Base {
  constructor(props) {
    super(props);
  }
  state = {
    data: [],
    noData: true,
    loading: true
  };
  componentWillMount() {
    this.fund = new Fund();
    this.loadData();
  }
  loadData = () => {
    const fundId = this.props.data.id;
    this.fund.get_connected_product(fundId).then(res => {
      if (res.success && res.result) {
        this.setState({
          data: res.result,
          noData: false
        });
      }

      this.setState({ loading: false });
    });
  };
  getColumns() {
    const columns = [
      {
        title: "已预约",
        dataIndex: "totalReservation",
        render: (text, record) => {
          return text ? `${text}万` : null;
        }
      },
      {
        title: "确认的预约",
        dataIndex: "confirmReservation",
        render: (text, record) => {
          return text ? `${text}万` : null;
        }
      },
      {
        title: "已报单",
        dataIndex: "totalDeclaration",
        render: (text, record) => {
          return text ? `${text}万` : null;
        }
      },
      {
        title: "确认的报单",
        dataIndex: "confirmDeclaration",
        render: (text, record) => {
          return text ? `${text}万` : null;
        }
      }
    ];

    return columns;
  }

  reload = () => {
    const { mod } = this.props;

    this.loadData();

    mod.loadData && mod.loadData();
    mod.refreshRootList && mod.refreshRootList();
  };
  render() {
    const { loading, noData } = this.state;
    const { data } = this.props;
    return (
      <div className={style.card}>
        <div className={style.header}>
          <div className={style.title}>募集管理</div>
        </div>
        <div className={style.content}>
          <Spin spinning={loading}>
            {!noData ? (
              <div className={style.imported_product}>
                <p className={style.title}>已导入到以下产品中进行募集管理：</p>
                <a
                  href={`/product/detail/${data.productId}`}
                  target="_blank"
                  className={style.name}
                >
                  {data.productName}>>
                </a>
                <Table
                  columns={this.getColumns()}
                  className={style.table}
                  pagination={false}
                  dataSource={[this.state.data]}
                />
              </div>
            ) : (
              <div className={style.import_product}>
                <p>
                  您可以将基金导入到财富管理系统中进行募集管理，募集结果将同步到这里。
                </p>
                <Button
                  onClick={() => {
                    this.importModal.show({ id: data.id });
                  }}
                >
                  导入财富管理
                </Button>
              </div>
            )}
          </Spin>
        </div>
        <div
          ref={ref => {
            if (ref) {
              this.container = ReactDOM.findDOMNode(ref);
            }
          }}
        >
          <ImportProductModal
            callback={this.reload}
            getContainer={() => this.container}
            ref={ref => {
              if (ref) {
                this.importModal = ref;
              }
            }}
          />
        </div>
      </div>
    );
  }
}
