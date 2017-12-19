import React, { Component } from "react";
import { Icon, Button, message, Card, Popconfirm, Row, Col, Table } from "antd";
import ClassNames from "classnames";
import moment from "moment";

import Base from "components/main/Base";

import GM from "lib/gridManager.js";

const GridManager = GM.GridManager;

import Withdrawal from "model/Assets/withdrawal";

import EditExitModal from "../../editWithdrawalModal";

import style from "./tabs.scss";

let editExitModal = null;

class InfoTable extends Base {
  state = {
    pagination: false,
    size: "default",
    scroll: undefined
  };

  getColumns = () => {
    const { data, permission } = this.props;

    const columns = [
      {
        dataIndex: "withdrawalTypeText",
        key: "withdrawalTypeText",
        title: "退出方式"
      },
      {
        dataIndex: "withdrawalAmount",
        key: "withdrawalAmount",
        title: "退出价格",
        render: (text, record) => {
          return text !== null ? `${text}万` : null;
        }
      },
      {
        dataIndex: "withdrawalShareRatio",
        key: "withdrawalShareRatio",
        title: "退出股份",
        render: (text, record) => {
          return text !== null ? `${text}%` : null;
        }
      },
      {
        dataIndex: "remainingRatio",
        key: "remainingRatio",
        title: "剩余股份",
        render: (value, record, index) => {
          const obj = {
            children:
              record.remainingRatio !== null
                ? `${record.remainingRatio}%`
                : null,
            props: {}
          };
          if (index == 0) {
            obj.props.rowSpan = data.withdrawalInfoList.length;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        }
      },
      {
        dataIndex: "requite",
        key: "requite",
        title: "估算回报",
        render: (text, record) => {
          return text !== null ? `${text}倍` : null;
        }
      },
      {
        key: "withdrawalDate",
        dataIndex: "withdrawalDate",
        title: "退出日期",
        render: (text, record) => {
          return text ? `${moment(text).format("YYYY-MM-DD")}` : null;
        }
      },
      {
        key: "operation",
        fixed: "right",
        width: 100,
        render: (text, record) => {
          return (
            <div className={style.operation}>
              {permission.editPermission ? (
                <a
                  onClick={() => {
                    record.projectName = data.projectName;
                    editExitModal.show(record);
                  }}
                  style={{ marginRight: 20 }}
                >
                  编辑
                </a>
              ) : null}

              {permission.editPermission ? (
                <Popconfirm
                  getPopupContainer={() => this.container}
                  title="确认删除本条信息?"
                  placement="topRight"
                  onConfirm={() => this.handleDel(record.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <a>删除</a>
                </Popconfirm>
              ) : null}
            </div>
          );
        }
      }
    ];
    return columns;
  };
  handleDel = id => {
    const { reload, withdrawal } = this.props;

    withdrawal.delete(id).then(res => {
      if (res.success) {
        message.success("删除本条信息成功");
        reload && reload();
      }
    });
  };
  render() {
    const { data } = this.props;
    data.withdrawalInfoList = data.withdrawalInfoList.map(item => {
      item.remainingRatio = data.remainingRatio;
      return item;
    });
    return (
      <div
        ref={ref => {
          if (ref) {
            this.container = ref;
          }
        }}
      >
        <GridManager
          gridWrapClassName={`grid-panel auto-width-grid ${style.table}`}
          noRowSelection={true}
          {...this.state}
          bordered={false}
          pagination={false}
          disabledAutoLoad={true}
          columns={this.getColumns()}
          dataSource={data.withdrawalInfoList}
          mod={this}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        />
      </div>
    );
  }
}

export default class FundWithdrawal extends Base {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.withdrawal = new Withdrawal();

    this.loadData();
  }
  loadData = () => {
    const { id, fundDto } = this.props.data;

    this.withdrawal.get_fund_page({ fundId: id }).then(res => {
      if (res.success) {
        this.setState({
          financing_list: res.result.datas || []
        });
      }
    });
  };
  reload = () => {
    const { mod } = this.props;

    this.loadData();

    mod.refreshRootList && mod.refreshRootList();
  };
  render() {
    const { financing_list } = this.state;

    const { data } = this.props;
    const { permission } = data.fundDto;

    return (
      <div className={style.body}>
        <Card title="退出管理" className={style.card} style={{ marginTop: 0 }}>
          {permission.editPermission ? (
            <div
              style={{
                textAlign: "right"
              }}
            >
              <Button
                onClick={() => {
                  editExitModal.show({
                    fundId: data.id
                  });
                }}
              >
                新增退出
              </Button>
            </div>
          ) : null}
          <ul className={style.withdrawal_tables}>
            {financing_list &&
              financing_list.map(item => {
                return (
                  <li className={style.withdrawal_tables_head}>
                    <div className={style.withdrawal_tables_head_title}>
                      退出项目：{item.projectName}
                    </div>
                    <div className={style.withdrawal_tables_head_desc}>
                      <Row>
                        <Col span="6">
                          <span>已退出：</span>
                          {item.totalWithdrawalAmount}万
                        </Col>
                        <Col span="12">
                          <span>已退出股份：</span>
                          {item.totalWithdrawalRatio}%（剩余股份{
                            item.remainingRatio
                          }%）
                        </Col>
                      </Row>
                    </div>
                    <InfoTable
                      data={item}
                      permission={permission}
                      reload={this.reload}
                      withdrawal={this.withdrawal}
                    />
                  </li>
                );
              })}
          </ul>
        </Card>
        <EditExitModal
          reload={this.reload}
          ref={ref => {
            if (ref) {
              editExitModal = ref;
            }
          }}
        />
      </div>
    );
  }
}
