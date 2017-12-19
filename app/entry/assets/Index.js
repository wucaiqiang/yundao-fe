import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { Breadcrumb, Button, Card, Col, Row, Icon } from "antd";
import ClassNames from "classnames";
import echarts from "echarts";
import moment from "moment";

import Base from "components/main/Base";
import Page from "components/main/Page";

import Utils from "utils/";

import Assets from "model/Assets/index";

import ProjectFloatPanel from "services/assets/project/detail/floatPanel";

import style from "./Index.scss";

export default class AssetsIndex extends Base {
  static get NAME() {
    return "AssetsIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsIndex.NAME]) {
      this.context = context;
    }

    this.state = {
      collapse: true,
      auditData: [],
      auditPermission: false,
      reportPermission: false,
      projectFunnel: [],
      industryLayout: []
    };
  }
  componentWillMount() {
    this.assets = new Assets();

    this.getAudit();
    this.getReport();
  }
  componentWillReceiveProps(nextProps) {
    this.getAudit();
    this.getReport();
  }
  componentDidMount() {}
  componentDidUpdate() {
    this.renderProject();
    this.renderInvest();
  }
  getReport() {
    this.assets.report().then(res => {
      res.success &&
        this.setState({ ...res.result, reportPermission: res.code !== 900002 });
    });
  }
  getAudit() {
    this.assets.audit().then(res => {
      res.success &&
        res.result &&
        this.setState({
          auditData: res.result.datas,
          auditPermission: res.code !== 900002
        });
    });
  }
  reload = () => {
    this.getAudit();
  };

  handleCollapse = () => {
    const { collapse } = this.state;

    this.setState({ collapse: !collapse });
  };
  renderProject() {
    const { projectFunnel = [], collapse } = this.state;

    //都为0时不渲染
    const isAllZero = projectFunnel.every(item => item.count === 0);
    if (isAllZero) return;

    let funnelDom = document.getElementById(style.funnel);
    let funnelChart = echarts.init(funnelDom);

    // 绘制图表
    funnelChart.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}个"
      },
      legend: {
        data: projectFunnel.map(item => item.name)
      },
      calculable: true,
      series: [
        {
          name: "漏斗图",
          type: "funnel",
          left: "10%",
          top: 60,
          bottom: 60,
          width: "80%",
          maxSize: "100%",
          sort: "descending",
          gap: 2,
          label: {
            normal: {
              show: true,
              position: "inside"
            },
            emphasis: {
              textStyle: {
                fontSize: 20
              }
            }
          },
          labelLine: {
            normal: {
              length: 10,
              lineStyle: {
                width: 1,
                type: "solid"
              }
            }
          },
          itemStyle: {
            normal: {
              borderColor: "#fff",
              borderWidth: 1
            }
          },
          data: projectFunnel.map(item => {
            return { name: item.name, value: item.count };
          })
        }
      ]
    });
  }
  renderInvest() {
    let { industryLayout = [] } = this.state;

    let radarDom = document.getElementById(style.radar);
    let radarChart = echarts.init(radarDom);

    //是否全为0
    let isAllZero = industryLayout.every(item => item.sumAmount === 0);

    let maxAmount = 0;
    //重排数据值
    industryLayout = industryLayout.sort((a, b) => a.sumAmount - b.sumAmount);
    //查找最大值
    industryLayout.map(item => {
      if (item.sumAmount > maxAmount) {
        maxAmount = item.sumAmount;
      }
    });
    // 绘制图表
    radarChart.setOption({
      tooltip: {},
      radar: {
        name: {
          textStyle: {
            color: "#fff",
            backgroundColor: "#999",
            borderRadius: 3,
            padding: [3, 5]
          }
        },
        indicator: industryLayout.map(item => {
          return {
            name: item.name,
            max: maxAmount
          };
        }),
        center: ["50%", "50%"],
        radius: "55%"
      },
      series: [
        {
          type: "radar",
          tooltip: {
            trigger: "item"
          },
          itemStyle: { normal: { areaStyle: { type: "default" } } },
          data: isAllZero
            ? []
            : [
                {
                  value: industryLayout.map(item => {
                    return item.sumAmount;
                  }),
                  name: "投资布局"
                }
              ]
        }
      ]
    });
  }
  render() {
    const {
      auditData,
      collapse,
      projectFunnel,
      industryLayout,
      auditPermission,
      reportPermission
    } = this.state;

    const hasAuditPermission = Utils.checkPermission("assets.index.audit.todo");
    const hasReportPermission = Utils.checkPermission("assets.index.report");
    const isAllZero = projectFunnel.every(item => item.count === 0);

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>首页</Breadcrumb.Item>
        </Breadcrumb>
        {hasAuditPermission === false && hasReportPermission === false ? (
          <div className={style.page}>
            <div className={style.nopermission}>无权限查看</div>
          </div>
        ) : (
          <div className={style.page}>
            {auditPermission ? (
              <div className={style.mb21}>
                <Card
                  noHovering
                  title="待我审批"
                  bodyStyle={{ padding: 0 }}
                  extra={
                    <Link to="/assets/project/audit_history">审批历史</Link>
                  }
                >
                  {auditData && auditData.length > 0 ? (
                    auditData.map((item, index) => {
                      return (
                        <Card.Grid
                          className={ClassNames(style.grid, {
                            [style.hidden]: collapse === true && index > 3
                          })}
                          key={item.projectId}
                        >
                          <h3 className={style.statusName}>
                            {item.auditItemName}
                          </h3>
                          <h2 className={style.projectName}>
                            {item.projectName}
                          </h2>
                          <div className="clearfix">
                            <div className="fl">
                              <p>申请人：{item.applyUserName}</p>
                              <p>
                                申请时间：{item.applyDate &&
                                  moment(item.applyDate).format(
                                    "YYYY-MM-DD HH:mm"
                                  )}
                              </p>
                            </div>
                            <Button
                              className={style.action}
                              role="floatPane"
                              onClick={() =>
                                this.projectFloatPanel.show({
                                  id: item.projectId,
                                  activeKey: "1"
                                })
                              }
                            >
                              审批
                            </Button>
                          </div>
                        </Card.Grid>
                      );
                    })
                  ) : (
                    <div className={style.empty}> 暂无审批</div>
                  )}
                </Card>
                {auditData && auditData.length > 4 ? (
                  collapse ? (
                    <div
                      className={style.collapse}
                      onClick={this.handleCollapse}
                    >
                      展开<Icon type="down" />
                    </div>
                  ) : (
                    <div
                      className={style.collapse}
                      onClick={this.handleCollapse}
                    >
                      收起<Icon type="up" />
                    </div>
                  )
                ) : null}
              </div>
            ) : null}
            {reportPermission ? (
              <Row className={`${style.mb21} ${style.chart}`} gutter={22}>
                <Col span={12}>
                  <Card title="项目漏斗" noHovering>
                    <div className={style.funnel} id={style.funnel}>
                      {isAllZero ? (
                        <div>
                          {projectFunnel.map(item => {
                            return (
                              <div className={"funnel_item"}>
                                <i className={"funnel_item_rec"} />
                                {item.name}
                              </div>
                            );
                          })}
                          <div className={style.empty}>暂无数据</div>
                        </div>
                      ) : null}
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="投资布局" noHovering>
                    <div id={style.radar} />
                  </Card>
                </Col>
              </Row>
            ) : null}
          </div>
        )}
        <ProjectFloatPanel
          ref={ref => (this.projectFloatPanel = ref)}
          root={this}
        />
      </Page>
    );
  }
}
