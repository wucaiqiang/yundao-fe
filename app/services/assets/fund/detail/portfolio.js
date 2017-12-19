import React, { Component } from "react";
import { Row, Col, Button, Card, Alert, Icon, message, Popconfirm } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import Confirm from "components/modal/Confirm";

import EditInvestModal from "services/assets/editInvestModal";

import Investment from "model/Assets/investment";
import Assets from "model/Assets/index";

import style from "./portfolio.scss";

function Header(props) {
  const { data } = props;
  return (
    <div className={style.header}>
      <h3 className={style.header_title}>出资项目：{data.projectName}</h3>
      <Row>
        <Col span={6}>
          <strong className={style.header_label}>合计投资金额：</strong>
          {data.totalAmount}万
        </Col>
        <Col span={12}>
          <strong className={style.header_label}>合计占股：</strong>
          {data.totalRatio}%（已退出{data.withdrawalRatio
            ? data.withdrawalRatio
            : 0}%，退出价格{data.withdrawalAmount ? data.withdrawalAmount : 0}万）
        </Col>
      </Row>
    </div>
  );
}

class RoundList extends Component {
  handleDel = id => {
    this.props.investment.delete(id).then(res => {
      if (res.success) {
        message.success("删除本条信息成功");
        this.props.reload && this.props.reload();
      }
    });
  };

  render() {
    const { data, permission } = this.props;

    return (
      <div
        ref={ref => {
          if (ref) {
            this.container = ref;
          }
        }}
      >
        <Card title="出资轮次" className={style.list} noHovering>
          {data &&
            data.map(item => {
              return (
                <div className={style.list_row} key={item.id}>
                  <Row className={style.list_row_head}>
                    <Col className={style.list_row_title} span={20}>
                      {item.roundText}
                    </Col>
                    <Col className={style.list_row_date} span={4}>
                      {item.investDate
                        ? moment(item.investDate).format("YYYY-MM-DD")
                        : null}
                    </Col>
                  </Row>
                  <Row type="flex" align="middle">
                    <Col span={20}>
                      <Row className={style.mb15}>
                        <Col span={6}>
                          <strong>投资金额：</strong>
                          {item.investAmount !== null
                            ? `${item.investAmount}万`
                            : null}
                        </Col>
                        <Col span={6}>
                          <strong>投资占股比例：</strong>
                          {item.shareRatio !== null
                            ? `${item.shareRatio}%`
                            : null}
                        </Col>
                        <Col span={6}>
                          <strong>领投/跟投：</strong>
                          {item.investLevelText}
                        </Col>
                      </Row>
                      <Row>
                        <Col span={6}>
                          <strong>投前估值：</strong>
                          {item.valuationBefore !== null
                            ? `${item.valuationBefore}万`
                            : null}
                        </Col>
                        <Col span={6}>
                          <strong>投后估值：</strong>
                          {item.valuationAfter !== null
                            ? `${item.valuationAfter}万`
                            : null}
                        </Col>
                        <Col span={6}>
                          <strong>投资方式：</strong>
                          {item.investTypeText}
                        </Col>
                      </Row>
                    </Col>
                    <Col className={style.list_row_action} span={4}>
                      {permission.editPermission ? (
                        <a
                          onClick={() => {
                            this.props.editInvestModal.show(item);
                          }}
                        >
                          编辑
                        </a>
                      ) : null}
                      {permission.editPermission ? (
                        <Popconfirm
                          getPopupContainer={() => this.container}
                          title="确认删除本条信息?"
                          placement="topRight"
                          onConfirm={() => this.handleDel(item.id)}
                          okText="删除"
                          cancelText="取消"
                        >
                          <a>删除</a>
                        </Popconfirm>
                      ) : null}
                    </Col>
                  </Row>
                </div>
              );
            })}
        </Card>
      </div>
    );
  }
}

export default class Portfolio extends Base {
  state = {
    loading: true,
    visible: false
  };
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.investment = new Investment();
    this.assets = new Assets();

    this.getData();
    this.found_get_list();
  }
  /**
   * 获取待导入出次
   */
  found_get_list = () => {
    const { id: fundId } = this.props.data;

    this.assets
      .found_get_list({
        fundId,
        type: "fund"
      })
      .then(res => {
        if (res.success) {
          this.setState({
            found_list: res.result || []
          });
        }
      });
  };
  getData = () => {
    const { id } = this.props.data;

    this.investment.get_fund_page({ fundId: id }).then(res => {
      if (res.success) {
        this.setState({
          projectList: res.result.datas || []
        });
      }
    });
  };

  reload = () => {
    const { mod } = this.props;

    this.getData();

    mod.refreshRootList && mod.refreshRootList();
  };
  handleImport = item => {
    const { found_list, projectList } = this.state;

    let isExist = false; //投资组合信息是否存在同一轮次，同一个基金
    let financing =
      projectList && projectList.find(row => row.round === item.round);

    if (financing && financing.financingPage) {
      isExist = financing.financingPage.some(fund => {
        return fund.fundName === item.fundName;
      });
    }

    if (isExist) {
      Confirm({
        width: 450,
        wrapClassName: "showfloat",
        title: "无法导入，已存在相同项目和轮次出资记录",
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

        this.reload();

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
      title: "关闭后，后续您可以手动新增出资",
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
    const { data, mod } = this.props;
    const { permission } = data.fundDto;

    const { found_list, projectList } = this.state;

    return (
      <div>
        <div className={style.found_list}>
          {found_list &&
            found_list.map(item => {
              return (
                <div className={style.found_list_item} key={item.id}>
                  <Alert
                    type="info"
                    showIcon
                    closable={false}
                    message={
                      <div>
                        立项投决中有新的出资决定审批通过，是否导入到投资组合中？（{
                          item.roundText
                        }，{item.projectName}，{item.investmentAmount}万，{
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
                </div>
              );
            })}
        </div>
        <Card title="投资组合" style={{ marginTop: 0 }}>
          {permission.editPermission ? (
            <div
              style={{
                textAlign: "right"
              }}
            >
              <Button
                onClick={() => {
                  this.editInvestModal.show({ fundId: data.id });
                }}
              >
                新增出资
              </Button>
            </div>
          ) : null}

          {projectList &&
            projectList.map(project => {
              return (
                <div className={style.block} key={project.projectId}>
                  <Header data={project} />
                  <RoundList
                    data={project.projectResDtoList}
                    permission={permission}
                    reload={this.reload}
                    editInvestModal={this.editInvestModal}
                    investment={this.investment}
                  />
                </div>
              );
            })}
        </Card>
        <EditInvestModal
          ref={ref => (this.editInvestModal = ref)}
          reload={this.reload}
        />
      </div>
    );
  }
}
