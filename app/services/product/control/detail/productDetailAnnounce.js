import React, { Component } from "react";
import { Row } from "antd";

import GM from "lib/gridManager";
import Utils from "utils/";

import GridBase from "base/gridMod";

import EditNoticeModal from "services/product/notice/editNoticeModal";

import style from "./productDetailInfo.scss";

const { GridManager } = GM;

export default class ProductDetailNotice extends GridBase {
  constructor(props) {
    super(props);
    this.state = {
      productId: this.props.productId
    };
  }
  componentWillMount() {
    this.apiUrl = `/product/notice/get_productId?productId=${this.state
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
        title: "公告标题",
        dataIndex: "title",
        width: 200,
        className: "ant-table-col",
        render: (text, record) => {
          return (
            <a
              title={record.title}
              onClick={() => {
                this.handleNoticeModal(record.id, false, false);
              }}
            >
              {record.title}
            </a>
          );
        }
      },
      {
        title: "公告类型",
        dataIndex: "noticeTypeName",
        width: 130
      },
      {
        title: "公告概要",
        dataIndex: "content",
        width: 200,
        className: "ant-table-col",
        render: (text, record) => {
          return <span title={record.content}>{record.content}</span>;
        }
      },
      {
        title: "公告附件",
        width: 200,
        render: (text, record) => {
          let attachs = record.baseProductNoticeAttach;
          return attachs && attachs.length > 0
            ? attachs.map(attach => {
                return (
                  <div key={attach.id}>
                    <a href={attach.url} target="_blank">
                      {attach.sourceName}
                    </a>
                  </div>
                );
              })
            : null;
        }
      },
      {
        title: "发布日期",
        dataIndex: "sendTime",
        width: 100,
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      }
    ];

    return columns;
  };

  handleNoticeModal = (noticeId, isEdit, canEdit) => {
    this.editNoticeModal.show(noticeId, isEdit, canEdit);
  };
  render() {
    return (
      <div className={style.body}>
        <Row>
          <div className={style.card}>
            <div className={style.header}>
              <div className={style.title}>产品公告</div>
            </div>
            <div className={style.content}>
              <GridManager
                gridWrapClassName="grid-panel auto-width-grid"
                url={this.apiUrl}
                noRowSelection={true}
                columns={this.getColumns()}
                mod={this}
                scroll={{
                  x: "120%"
                }}
                ref={gridManager => {
                  gridManager && (this.gridManager = gridManager);
                }}
              />

              <EditNoticeModal
                ref={ref => (this.editNoticeModal = ref)}
                container={this.container}
              />
            </div>
          </div>
        </Row>
      </div>
    );
  }
}
