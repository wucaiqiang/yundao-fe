import React, { Component } from "react";
import {
  Button,
  Icon,
  Table,
  Card,
  Collapse,
  Popconfirm,
  Alert,
  message
} from "antd";
import moment from "moment";

import Base from "components/main/Base";
import Confirm from "components/modal/Confirm";

import AddRoundInvestorModal from "./AddRoundInvestorModal";
import AddRoundModal from "./AddRoundModal";

import Dictionary from "model/dictionary";
import Assets from "model/Assets/index";
import Decision from "model/Project/decision";

import style from "./financingInfo.scss";

const NAME = "DetailfinancingInfo";

let addRoundInvestorModal = null;
let addRoundModal = null;

class InfoTable extends Base {
  state = {
    pagination: false,
    size: "default",
    scroll: undefined
  };

  getColumns = () => {
    this.assets = new Assets();
    const { data, permission } = this.props;

    let investmentAmount = 0,
      shareRatio = 0;

    data.financingPage.map(item => {
      investmentAmount += item.investmentAmount;
      shareRatio += item.shareRatio;
    });

    const OperationTitle = (
      <div className={style.operation}>
        {permission.editPermission ? (
          <a
            onClick={() => {
              addRoundModal.show(data);
            }}
            style={{ marginRight: 20 }}
          >
            编辑
          </a>
        ) : null}
        {permission.editPermission ? (
          <Popconfirm
            placement="topRight"
            title={
              <div>
                <p>确认删除本轮次融资信息?</p>
                {data && data.financingPage && data.financingPage.length > 0 ? (
                  <p>删除后，该轮次下所有投资方信息将会被一起删除</p>
                ) : null}
              </div>
            }
            getPopupContainer={() => document.getElementById(NAME)}
            onConfirm={() => {
              this.assets.financing_delete_round(data.id).then(res => {
                if (res.success) {
                  message.success("删除本轮融资信息成功");
                  this.props.reload();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        ) : null}
      </div>
    );

    const columns = [
      {
        dataIndex: "fundName",
        key: "fundName",
        width: "30%",
        title: data.roundText
      },
      {
        dataIndex: "investmentAmount",
        key: "investmentAmount",
        width: "15%",
        title: `${investmentAmount}万`,
        render: (text, record) => {
          return `${text}万`;
        }
      },
      {
        dataIndex: "shareRatio",
        key: "shareRatio",
        width: "15%",
        title: `出让${shareRatio}%`,
        render: (text, record) => {
          return `${record.shareRatio}%`;
        }
      },
      {
        key: "desc",
        width: "25%",
        title: data.time ? moment(data.time).format("YYYY-MM-DD") : null,
        render: (text, record) => {
          return `${record.userName}创建于${moment(record.createDate).format(
            "YYYY-MM-DD"
          )}`;
        }
      },
      {
        key: "operation",
        width: "15%",
        title: OperationTitle,
        render: (text, record) => {
          return (
            <div className={style.operation}>
              {permission.editPermission ? (
                <a
                  onClick={() => {
                    addRoundInvestorModal.show(record);
                  }}
                  style={{ marginRight: 20 }}
                >
                  编辑
                </a>
              ) : null}

              {permission.editPermission ? (
                <Popconfirm
                  placement="topRight"
                  title="确定删除该投资方信息?"
                  getPopupContainer={() => document.getElementById(NAME)}
                  onConfirm={() => {
                    this.assets.financing_delete_info(record.id).then(res => {
                      if (res.success) {
                        message.success("删除成功");
                        this.props.reload();
                      }
                    });
                  }}
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

  render() {
    const { data, permission } = this.props;
    return (
      <Table
        className={style.table}
        {...this.state}
        footer={
          permission.editPermission
            ? () => {
                return (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      addRoundInvestorModal.show({
                        finacingRoundId: data.id
                      });
                    }}
                    className={style.table_footer}
                  >
                    <Icon type="plus" />
                    新增投资方
                  </div>
                );
              }
            : null
        }
        columns={this.getColumns()}
        dataSource={data.financingPage}
      />
    );
  }
}

export default class DetailfinancingInfo extends Base {
  constructor(props) {
    super(props);
    this.state = {
      found_list: [],
      projectId: this.props.data.data.id
    };
  }

  componentWillMount() {
    this.assets = new Assets();

    this.found_get_list();
    this.load_round();
  }
  found_get_list = () => {
    const { projectId } = this.state;
    this.assets
      .found_get_list({
        projectId,
        type: "project"
      })
      .then(res => {
        if (res.success) {
          this.setState({
            found_list: res.result || []
          });
        }
      });
  };
  load_round = () => {
    const { projectId } = this.state;
    this.assets
      .financing_get_page({
        projectId
      })
      .then(res => {
        if (res.success) {
          this.setState({
            financing_list: res.result.datas || []
          });
        }
      });
  };
  handleImport = item => {
    const { found_list, financing_list } = this.state;

    let isExist = false; //融资信息是否存在同一轮次，同一个基金
    let financing =
      financing_list && financing_list.find(row => row.round === item.round);

    if (financing && financing.financingPage) {
      isExist = financing.financingPage.some(fund => {
        return fund.fundName === item.fundName;
      });
    }

    if (isExist) {
      Confirm({
        width: 450,
        wrapClassName: "showfloat",
        title: "无法导入，已存在相同轮次和基金的融资信息",
        onOk: () => {
          this.assets.found_clear(item.id).then(res => {
            if (res.success) {
              this.setState({
                found_list: found_list.filter(found => found.id != item.id)
              });
            }
          });
        }
      });

      return;
    }

    this.assets.found_import(item.id).then(res => {
      if (res.success) {
        message.success("导入成功");
        this.load_round();
        this.setState({
          found_list: found_list.filter(found => found.id != item.id)
        });
      }
    });
  };
  handleClose = (item, found_list) => {
    Confirm({
      width: 450,
      wrapClassName: "showfloat",
      title: "关闭后，后续您可以手动新增相关的融资信息",
      onOk: () => {
        this.assets.found_clear(item.id).then(res => {
          if (res.success) {
            this.setState({
              found_list: found_list.filter(found => found.id != item.id)
            });
          }
        });
      }
    });
  };
  render() {
    const { found_list, financing_list, projectId } = this.state;
    const { permission } = this.props.data;

    return (
      <div className={style.page} id={NAME}>
        <div className={style.found_list}>
          {found_list &&
            found_list.map(item => {
              return (
                <li className={style.found_list_item} key={item.id}>
                  <Alert
                    type="info"
                    showIcon
                    closable={false}
                    message={
                      <div>
                        立项投决中有新的出资决定审批通过，是否导入到融资信息中？（{
                          item.roundText
                        }，{item.fundName}，{item.investmentAmount}万，{
                          item.shareRatio
                        }%）
                        {permission.editPermission ? (
                          <a onClick={() => this.handleImport(item)}>导入</a>
                        ) : null}
                        {permission.editPermission ? (
                          <a
                            onClick={() => this.handleClose(item, found_list)}
                            style={{ marginLeft: "10px" }}
                          >
                            关闭
                          </a>
                        ) : null}
                      </div>
                    }
                  />
                </li>
              );
            })}
        </div>
        <Card title="融资信息" className={style.card}>
          <div className={style.content}>
            <div
              className={style.icons}
              style={{
                textAlign: "right"
              }}
            >
              {permission.editPermission ? (
                <Button
                  onClick={() => {
                    addRoundModal.show({ projectId });
                  }}
                >
                  新增融资信息
                </Button>
              ) : null}
            </div>
            <div className={style.info_tables}>
              {financing_list &&
                financing_list.map(item => {
                  return (
                    <InfoTable
                      key={item.id}
                      data={item}
                      permission={permission}
                      reload={this.load_round}
                    />
                  );
                })}
            </div>
          </div>
        </Card>

        <AddRoundInvestorModal
          reload={() => {
            this.load_round();
          }}
          ref={ref => {
            addRoundInvestorModal = ref;
          }}
        />
        <AddRoundModal
          reload={() => {
            this.load_round();
          }}
          ref={ref => {
            addRoundModal = ref;
          }}
        />
      </div>
    );
  }
}
