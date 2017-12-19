import React, { Component } from "react";
import ReactDOM from "react-dom";
import {
  Button,
  Icon,
  Input,
  Table,
  Row,
  Col,
  Steps,
  Card,
  Collapse,
  Popover,
  Popconfirm,
  Timeline,
  message
} from "antd";
import ClassNames from "classnames";
import moment from "moment";

import Base from "components/main/Base";
import UploadCard from "components/upload/";

import Decision from "model/Project/decision";
import Assets from "model/Assets/index";

import FinalDecisionModal from "../finalDecisionModal";
import AddAdviceModal from "../addAdviceModal";
import AuditRecordModal from "../auditRecordModal";
import AddRoundModal from "../addRoundModal";

import style from "./index.scss";

const Panel = Collapse.Panel;

function ProjectSummary(props) {
  const { data } = props;
  return (
    <div>
      <Row className={style.mb15}>
        <Col span={6}>
          <strong>投前估值：</strong>
          {data.valuationBefore ? `${data.valuationBefore}万` : null}
        </Col>
        <Col span={6}>
          <strong>投资主体：</strong>
          {data.fundName}
        </Col>
        <Col span={6}>
          <strong>领投/跟投：</strong>
          {data.investLevelText}
        </Col>
        <Col span={6}>
          <strong>投资金额：</strong>
          {data.investmentAmount ? `${data.investmentAmount}万` : null}
        </Col>
      </Row>
      <Row className={style.mb15}>
        <Col span={6}>
          <strong>投资轮次：</strong>
          {data.roundText}
        </Col>
        <Col span={6}>
          <strong>投资占股比例：</strong>
          {data.shareRatio ? `${data.shareRatio}%` : null}
        </Col>
        <Col span={6}>
          <strong>投后估值：</strong>
          {data.valuationAfter ? `${data.valuationAfter}万` : null}
        </Col>
        <Col span={6}>
          <strong>投资方式：</strong>
          {data.investTypeText}
        </Col>
      </Row>
      <Row>
        <strong>决策备注：</strong>
        {data.remark}
      </Row>
    </div>
  );
}
class FileTable extends Component {
  state = {
    files: [],
    canEdit: false
  };

  componentWillMount() {
    const { files, canEdit } = this.props;
    this.setState({ files, canEdit });
  }
  componentDidMount() {
    this.popupContainer = ReactDOM.findDOMNode(this);
  }
  componentWillReceiveProps(nextProps) {
    const { files, canEdit } = nextProps;
    this.setState({ files, canEdit });
  }

  getColumns() {
    const columns = [
      {
        dataIndex: "name",
        key: "name",
        width: "50%",
        render: (text, record) => (
          <div>
            <img
              className={style.file_icon}
              src={`/assets/images/ext/${record.extName}@1x.png`}
            />
            <a href={record.url} target="_blank">
              {text}
            </a>
          </div>
        )
      },
      {
        dataIndex: "creator",
        key: "creator",
        width: "30%",
        render: (text, record) => {
          return `${record.creator} ${record.createDate} 上传`;
        }
      },
      {
        key: "action",
        width: "20%",
        render: (text, record) => (
          <span>
            <a
              className={style.mr20}
              href={record.url}
              onClick={() => {
                this.handleDownload({
                  fileId: record.id,
                  type: 2
                });
              }}
              download={record.name}
              target="_blank"
            >
              下载
            </a>
            {this.state.canEdit ? (
              <Popconfirm
                placement="topRight"
                title={"删除不可撤回，确定删除？"}
                getPopupContainer={() => this.popupContainer}
                onConfirm={() => this.handleDel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            ) : null}
          </span>
        )
      }
    ];

    return columns;
  }
  handleSave = file => {
    const _this = this;
    let { url, name } = file;
    let extName = url.substr(url.lastIndexOf(".") + 1);

    let newFile = {
      url,
      name,
      extName,
      flowId: this.props.flowId
    };

    this.props.decision.add_file(newFile).then(res => {
      if (res.success) {
        // message.success("添加文件成功");
        let { files } = _this.state;

        if (!files) files = [];

        files.push({ ...newFile, ...res.result });

        _this.setState({ files });
      }
    });
  };
  /**
   * 删除文件
   */
  handleDel = id => {
    const _this = this;

    this.props.decision.delete_file(id).then(res => {
      if (res.success) {
        message.success("文件删除成功");

        let files = _this.state.files.filter(file => file.id !== id);

        _this.setState({ files });
      }
    });
  };
  handleDownload(data) {
    this.props.decision.record_download(data);
  }
  render() {
    const { files, canEdit } = this.state;

    return (
      <Table
        pagination={false}
        showHeader={false}
        rowKey="id"
        title={() => `${this.props.title}文件`}
        footer={
          canEdit
            ? () => (
                <UploadCard
                  listType="picture"
                  showUploadList={false}
                  fileCount={20}
                  fileSize="30MB"
                  fileList={files}
                  onSave={this.handleSave}
                >
                  <span className={style.btnUpload}>
                    <Icon type="plus" />上传
                  </span>
                </UploadCard>
              )
            : null
        }
        rowSelection={null}
        scroll={undefined}
        columns={this.getColumns()}
        dataSource={files}
      />
    );
  }
}

class AdviceTable extends Component {
  state = {
    suggestionData: {
      suggestions: []
    }
  };

  componentWillMount() {
    const { decisionId } = this.props;
    this.getSuggestion(decisionId);
  }
  componentDidMount() {
    this.popupContainer = ReactDOM.findDOMNode(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.decisionId !== nextProps.decisionId) {
      this.getSuggestion(nextProps.decisionId);
    }
  }
  getColumns() {
    let columns = [
      {
        title: "意见人",
        dataIndex: "proposer",
        key: "proposer",
        width: 120
      },
      {
        title: "意见",
        dataIndex: "suggestText",
        key: "suggestText",
        width: 100
      },
      {
        title: "详情",
        dataIndex: "remark",
        key: "remark"
      },
      {
        title: "创建人",
        dataIndex: "creator",
        key: "creator",
        width: 150
      },
      {
        title: "创建时间",
        dataIndex: "createDate",
        key: "createDate",
        width: 140,
        render: text => {
          return moment(text).format("YYYY-MM-DD HH:mm");
        }
      }
    ];

    if (this.props.canEdit) {
      columns.push({
        title: "操作",
        dataIndex: "action",
        width: 100,
        render: (text, record) => {
          const { suggestionData } = this.state;

          return (
            <span>
              <a
                className={style.mr20}
                onClick={() => {
                  record.suggest = record.suggest.toString();
                  this.addAdviceModal.show(record);
                }}
              >
                编辑
              </a>
              <Popconfirm
                placement="topRight"
                title={"删除不可撤回，确定删除？"}
                getPopupContainer={() => this.popupContainer}
                onConfirm={() => this.handleDel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        }
      });
    }

    return columns;
  }
  /**
   * 获取初审意见
   * @param {Int} id
   */
  getSuggestion = decisionId => {
    const { decision } = this.props;

    decision.gets_suggestion(decisionId).then(res => {
      res.success && this.setState({ decisionId, suggestionData: res.result });
    });
  };

  handleDel = id => {
    this.props.decision.delete_suggestion(id).then(res => {
      if (res.success) {
        message.success("意见删除成功");
        this.getSuggestion();
      }
    });
  };
  render() {
    const { suggestionData } = this.state;

    return (
      <div>
        <div
          className={ClassNames(
            style.defineProject_approval_subTitle,
            "clearfix"
          )}
        >
          <strong>初审意见</strong>
          {this.props.canEdit ? (
            <Button
              className={style.defineProject_approval_action}
              onClick={() =>
                this.addAdviceModal.show({
                  decisionId: this.state.decisionId
                })
              }
            >
              新增意见
            </Button>
          ) : null}
        </div>
        <div className={style.mb50}>
          <Table
            pagination={false}
            rowSelection={null}
            size="middle"
            scroll={undefined}
            columns={this.getColumns()}
            dataSource={suggestionData.suggestions}
          />
        </div>
        <AddAdviceModal
          ref={ref => (this.addAdviceModal = ref)}
          reload={() => this.getSuggestion(this.state.decisionId)}
        />
      </div>
    );
  }
}

class Remark extends Component {
  state = {
    editing: false,
    remark: null
  };
  componentWillMount() {
    const { data } = this.props;

    this.setState({ remark: data.remark });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ remark: nextProps.data.remark });
  }
  handleEdit = () => {
    this.setState({ editing: true });
  };
  handleSave = e => {
    let { data: { flowId } } = this.props;
    let remark = e.target.value;

    this.props.decision.update_remark({ flowId, remark }).then(res => {
      if (res.success) {
        message.success("备注保存成功");
        this.setState({ editing: false, remark });
      }
    });
  };

  setPosition(tObj, sPos) {
    if (tObj.setSelectionRange) {
      setTimeout(function() {
        tObj.setSelectionRange(sPos, sPos);
        tObj.focus();
      }, 0);
    } else if (tObj.createTextRange) {
      var rng = tObj.createTextRange();
      rng.move("character", sPos);
      rng.select();
    }
  }
  render() {
    const { data, permission } = this.props;

    const { editing, remark } = this.state;

    return (
      <div className={style.defineProject_approval_remark}>
        <strong>备注：</strong>
        {editing ? (
          <Input.TextArea
            autosize={{ minRows: 2, maxRows: 6 }}
            onBlur={this.handleSave}
            defaultValue={remark}
            ref={ref => {
              if (ref) {
                try {
                  const dom = ReactDOM.findDOMNode(ref);
                  dom.click();
                  //尝试移动光标到最后
                  var sPos = dom.value.length;
                  this.setPosition(dom, sPos);
                } catch (error) {}
              }
            }}
          />
        ) : (
          remark
        )}
        {permission.editPermission && data.canEdit ? (
          editing === false ? (
            <Icon type="edit" onClick={this.handleEdit} />
          ) : null
        ) : null}
      </div>
    );
  }
}

class HistoryPanel extends Base {
  state = { data: {} };
  componentWillMount() {
    this.loadData();
  }
  loadData = () => {
    const { data, assets } = this.props;
    assets.decision_get(data.id).then(res => {
      if (res.success) {
        this.setState({
          data: res.result
        });
      }
    });
  };
  render() {
    const { data } = this.state;
    return (
      <div>
        <p className={style.invest_log_status}>
          状态：{data.statusText}
          <a
            onClick={() => {
              this.props.auditRecordModal.show({
                id: data.id,
                mode: "decision"
              });
            }}
          >
            审批记录
          </a>
        </p>
        <div className={style.decision}>
          <div className={style.invest_log_title}>投委会决定</div>
          <ProjectSummary data={data} />
        </div>
        <div className={style.invest_log_title}>文件</div>
        {data.decisionFlowDtos &&
          data.decisionFlowDtos.map(item => {
            return (
              <div className={style.invest_log_files} key={item.id}>
                <FileTable
                  title={item.name}
                  canEdit={false}
                  files={item.files || []}
                />
              </div>
            );
          })}

        {data.id ? (
          <AdviceTable
            decisionId={data.id}
            canEdit={false}
            decision={this.props.decision}
          />
        ) : null}
        <div className={style.invest_log_remark}>
          {data.decisionFlowDtos &&
            data.decisionFlowDtos.map(item => {
              return (
                <p key={item.id}>
                  <span className={style.label}>{item.name}备注</span>：{
                    item.remark
                  }
                </p>
              );
            })}
        </div>
      </div>
    );
  }
}

export default class DetailDefineProject extends Base {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  componentWillMount() {
    this.decision = new Decision();
    this.assets = new Assets();

    let { projectData } = this.props;

    if (projectData && projectData.data.decisionId) {
      this.getData(projectData.data.decisionId);
    }

    this.getHistory();
  }

  /**
   * 获取投决数据
   */
  getData = id => {
    this.decision.get(id).then(res => {
      res.success && this.setState({ decisionId: id, data: res.result });
    });
  };
  /**
   * 获取历史投决资料
   */
  getHistory = () => {
    let { projectData } = this.props;

    this.assets.get_history(projectData.data.id).then(res => {
      this.setState({
        history_list: res.result
      });
    });
  };

  reload = () => {
    const { decisionId } = this.state;
    this.getData(decisionId);
  };
  /**
   * 新增轮次回调函数
   */
  handleCallback = decisionId => {
    this.getData(decisionId);
    this.getHistory();

    const { mod } = this.props;
    mod && mod.reload && mod.reload();
  };

  /**
   * 提交审批/重新提交审批
   */
  handleSubmit = model => {
    const _this = this;

    this.setState({ submiting: true });

    this.decision.submit(model).then(res => {
      this.setState({ submiting: false });

      if (res.success) {
        //model.action  7：提交，4：重新提交
        message.success(
          model.action === 7 ? "提交审批成功" : "重新提交审批成功"
        );
        //刷新投决数据
        _this.reload();

        const { mod } = _this.props;
        mod && mod.loadData && mod.loadData();
      }
    });
  };
  render() {
    const { projectData } = this.props;
    const { submiting, data, decisionId, history_list } = this.state;

    let currentStep = { sort: 1 };

    if (data.decisionFlowDtos) {
      currentStep = data.decisionFlowDtos.find(step => {
        return !step.isComplete;
      });

      if (!currentStep) {
        currentStep = {
          sort: data.decisionFlowDtos[data.decisionFlowDtos.length - 1].sort + 1
        };
      }
    }

    return (
      <div className={style.defineProject}>
        <div className={style.defineProject_header}>
          <div className={style.defineProject_header_title}>
            {projectData.permission.editPermission ? (
              <Button
                className={style.action}
                onClick={() =>
                  this.addRoundModal.show({
                    projectId: projectData.data.id,
                    oldRound: data.round
                  })
                }
              >
                新增轮次
              </Button>
            ) : null}
            {decisionId ? (
              <a
                onClick={() =>
                  this.auditRecordModal.show({
                    id: decisionId,
                    mode: "decision"
                  })
                }
              >
                审批记录
              </a>
            ) : null}
          </div>
          {data.decisionFlowDtos ? (
            <div className={style.defineProject_header_steps}>
              <Steps progressDot current={currentStep.sort - 1}>
                {data.decisionFlowDtos.map(step => {
                  return (
                    <Steps.Step
                      key={step.sort}
                      title={`${step.sort}、${step.name}`}
                    />
                  );
                })}
              </Steps>
            </div>
          ) : null}
          {data.decisionFlowDtos ? (
            <div className={style.defineProject_header_caption}>
              <ProjectSummary data={data} />
            </div>
          ) : null}
        </div>
        {data.decisionFlowDtos ? (
          <div className={style.defineProject_approval}>
            <Timeline>
              {data.decisionFlowDtos.map((step, index) => {
                return (
                  <Timeline.Item
                    key={step.sort}
                    color={step.isComplete ? "green" : "blue"}
                  >
                    <div>
                      <div className={style.defineProject_approval_title}>
                        <strong>{`${step.sort}、${step.name}`}</strong>
                        <span>{step.auditTips}</span>

                        {step.rejectText ? (
                          <Popover placement="top" content={step.rejectText}>
                            <Icon type="question-circle-o" />
                          </Popover>
                        ) : null}

                        {projectData.permission.editPermission &&
                        step.canSubmit ? (
                          <a
                            disabled={submiting}
                            onClick={() =>
                              this.handleSubmit({
                                flowId: step.flowId,
                                action: 7
                              })
                            }
                          >
                            {submiting ? <Icon type="loading" /> : null}
                            提交审批
                          </a>
                        ) : null}
                        {projectData.permission.editPermission &&
                        step.canReSubmit ? (
                          <a
                            disabled={submiting}
                            onClick={() =>
                              this.handleSubmit({
                                flowId: step.flowId,
                                action: 4
                              })
                            }
                          >
                            {submiting ? <Icon type="loading" /> : null}
                            重新提交审批
                          </a>
                        ) : null}
                      </div>
                      {step.status === 30 ? (
                        <AdviceTable
                          canEdit={
                            step.canEdit &&
                            projectData.permission.editPermission
                          }
                          decision={this.decision}
                          decisionId={decisionId}
                        />
                      ) : step.status === 40 ? (
                        <div>
                          <div
                            className={ClassNames(
                              style.defineProject_approval_subTitle,
                              "clearfix"
                            )}
                          >
                            <strong>
                              投委会决定
                              {data.investOrNotText
                                ? `(${data.investOrNotText})`
                                : null}
                            </strong>
                            {projectData.permission.editPermission &&
                            step.canEdit ? (
                              <Button
                                className={style.defineProject_approval_action}
                                onClick={() => {
                                  data.decisionId = decisionId;
                                  data.investLevel &&
                                    (data.investLevel = data.investLevel.toString());
                                  data.investType &&
                                    (data.investType = data.investType.toString());

                                  this.finalDecisionModal.show(data);
                                }}
                              >
                                最终决定
                              </Button>
                            ) : null}
                          </div>
                          <div className={style.defineProject_approval_summary}>
                            <ProjectSummary data={data} />
                          </div>
                        </div>
                      ) : null}

                      <FileTable
                        title={step.name}
                        files={step.files}
                        canEdit={
                          projectData.permission.editPermission && step.canEdit
                        }
                        decision={this.decision}
                        flowId={step.flowId}
                      />

                      <Remark
                        data={step}
                        permission={projectData.permission}
                        decision={this.decision}
                      />
                    </div>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </div>
        ) : null}

        <Card
          title="历史投决资料"
          style={{ marginTop: 22 }}
          className={style.card}
        >
          {!history_list ? "暂无历史投决资料" : ""}
          <div className={style.invest_log}>
            <Collapse bordered={false}>
              {history_list &&
                history_list.map((item, index) => {
                  return (
                    <Panel
                      header={
                        <div>
                          <span className="title">
                            {item.roundText}投决资料
                          </span>
                          <span className="summary">
                            {item.overUser} 归档于{moment(item.overDate).format(
                              "YYYY-MM-DD"
                            )}
                          </span>
                        </div>
                      }
                      key={index}
                    >
                      <HistoryPanel
                        data={item}
                        assets={this.assets}
                        decision={this.decision}
                        auditRecordModal={this.auditRecordModal}
                      />
                    </Panel>
                  );
                })}
            </Collapse>
          </div>
        </Card>
        <AddRoundModal
          ref={ref => (this.addRoundModal = ref)}
          reload={this.handleCallback}
        />
        <FinalDecisionModal
          ref={ref => (this.finalDecisionModal = ref)}
          reload={this.reload}
        />
        <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
      </div>
    );
  }
}
