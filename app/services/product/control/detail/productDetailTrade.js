import React, { Component } from "react";
import { Row } from "antd";

import GM from "lib/gridManager";
import Utils from "utils/";

import GridBase from "base/gridMod";

import style from "./productDetailInfo.scss";

const { GridManager } = GM;

class ProductDetail extends GridBase {
  constructor(props) {
    super(props);
    this.state = {
      productId: this.props.productId
    };
  }
  componentWillMount() {
    this.apiUrl = `/declaration/get_page_for_pro_detail?productId=${this.state
      .productId}`;
  }

  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }
  componentWillReceiveProps(nextProps) {
    const productId = this.props.productId;
    if (nextProps.productId !== productId) {
      this.setState(
        {
          productId: nextProps.productId
        },
        () => {
          this.doReloadGrid();
        }
      );
    }
  }
  getColumns = () => {
    const columns = [
      {
        title: "报单编号",
        dataIndex: "number",
        width: 120
      },
      {
        title: "客户名称",
        dataIndex: "title",
        render: (text, record) => {
          return record.customerName;
        }
      },
      {
        title: "客户编号",
        dataIndex: "customerNumber",
        width: 120
      },
      {
        title: "认购金额",
        render: (text, record) => {
          return `${record.dealAmount}万`;
        }
      },
      {
        title: "打款日期",
        dataIndex: "payDate",
        width: 140,
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "打款凭证",
        dataIndex: "hasPayEvidenceText",
        width: 100
      }
    ];

    return columns;
  };
  render() {
    const { data } = this.props;
    return (
      <div className={style.body}>
        <Row>
          <div className={style.card}>
            <div className={style.header}>
              <div className={style.title}>交易信息</div>
            </div>
            <div className={style.content}>
              <GridManager
                gridWrapClassName="grid-panel auto-width-grid"
                url={this.apiUrl}
                noRowSelection={true}
                columns={this.getColumns()}
                mod={this}
                ref={gridManager => {
                  gridManager && (this.gridManager = gridManager);
                }}
              />
            </div>
          </div>
        </Row>
      </div>
    );
  }
}

export default ProductDetail;
