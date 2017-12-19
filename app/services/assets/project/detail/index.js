import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Layout, Tabs, Alert, Affix, Row, Col, Button, message } from "antd";
import classNames from "classnames";

import Base from "components/main/Base";
import Permission from "components/permission";

import AuditModal from "services/common/auditModal";

import Audit from "model/Project/audit";

import Head from "./head";
import ProjectInfo from "./projectInfo";
import DefineProject from "./defineProject";
import FinancingInfo from "./financingInfo";
import CompanyInfo from "./companyInfo";
import RecordInfo from "./recordInfo";

import RenderTo from "components/renderTo";

import AuditRecordModal from "../auditRecordModal";

import style from "./index.scss";

const { TabPane } = Tabs;

export default class DetailIndex extends Base {
  state = {
    loading: true,
    visible: false,
    tipMessage: ""
  };
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.audit = new Audit();

    this.setState({
      activeKey: this.props.data.activeKey || "0"
    });

    //立项投决流程映射功能权限code及接口地址
    this.statusMapPermissionAndApi = {
      10: {
        code: "assets.project.decision.audit_decisioning",
        request: this.audit.audit_decisioning
      },
      20: {
        code: "assets.project.decision.audit_due_diligence",
        request: this.audit.audit_due_diligence
      },
      30: {
        code: "assets.project.decision.audit_first_trial",
        request: this.audit.audit_first_trial
      },
      40: {
        code: "assets.project.decision.audit_investment_commission",
        request: this.audit.audit_investment_commission
      },
      50: {
        code: "assets.project.decision.audit_invest",
        request: this.audit.audit_invest
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.activeKey) {
      console.log("nextProps.data", nextProps.data);
      this.setState({
        activeKey: nextProps.data.activeKey
      });
    }
  }

  /**
   * 通过/驳回 回调函数
   */
  handleAuditCallback = (values, auditModal) => {
    const { data, mod } = this.props;
    const request = this.statusMapPermissionAndApi[data.data.shouldAuditStatus]
      .request;

    let postData = {
      decisionId: data.data.decisionId,
      action: this.action,
      commit: values.reason
    };

    return request(postData).then(res => {
      auditModal.commit(false);
      if (res.success) {
        message.success("审批成功");

        auditModal.hide();

        mod.reload();

        this.defineProject && this.defineProject.reload();
      }
    });
  };

  render() {
    const { data, mod, submiting } = this.props;

    const ToolBar = Permission(
      <div>
        <Button
          onClick={() => {
            this.action = 1;
            this.auditPassModal.show();
          }}
        >
          通过
        </Button>
        <Button
          onClick={() => {
            this.action = 2;
            this.auditModal.show();
          }}
        >
          驳回
        </Button>
        <a
          onClick={() =>
            this.auditRecordModal.show({
              id: data.data.decisionId,
              mode: "decision"
            })
          }
        >
          审批记录
        </a>
      </div>
    );

    if (data.permission.readPermission === false) {
      return <div className={style.content}>无权限查看</div>;
    }

    return (
      <div
        className={style.content}
        ref={ref => {
          this.container = ref;
        }}
      >
        <Head projectData={data} />
        <div
          className={classNames({
            [style.tabs]:
              data.data.shouldAuditStatus && data.permission.editPermission
          })}
        >
          <Tabs
            defaultActiveKey="1"
            activeKey={this.state.activeKey}
            onTabClick={activeKey => {
              this.setState({ activeKey });
            }}
          >
            <TabPane tab="项目信息" key="0">
              {this.state.activeKey == "0" ? (
                <ProjectInfo
                  data={data}
                  mod={mod}
                  ref={ref => (this.customerDetailDynamic = ref)}
                />
              ) : null}
            </TabPane>
            <TabPane tab="立项投决" key="1">
              {this.state.activeKey == "1" ? (
                <DefineProject
                  projectData={data}
                  ref={ref => (this.defineProject = ref)}
                  parent={this}
                  mod={mod}
                />
              ) : null}
            </TabPane>
            <TabPane tab="融资信息" key="2">
              {this.state.activeKey == "2" ? (
                <FinancingInfo data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="公司信息" key="3">
              {this.state.activeKey == "3" ? (
                <CompanyInfo data={data} mod={mod} />
              ) : null}
            </TabPane>
            <TabPane tab="记录" key="4">
              {this.state.activeKey == "4" ? (
                <RecordInfo projectId={data.data.id} mod={mod} />
              ) : null}
            </TabPane>
          </Tabs>
          {data.data.shouldAuditStatus &&
            data.permission.editPermission && (
              <RenderTo to={ReactDOM.findDOMNode(mod.container)}>
                <div className={style.toolbar}>
                  <ToolBar
                    auth={
                      this.statusMapPermissionAndApi[
                        data.data.shouldAuditStatus
                      ].code
                    }
                  />
                </div>
              </RenderTo>
            )}
        </div>
        <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
        <AuditModal
          title={`通过${data.data.statusText}审批`}
          labelName="审批意见"
          required={false}
          ref={ref => (this.auditPassModal = ref)}
          callback={this.handleAuditCallback}
        />
        <AuditModal
          ref={ref => (this.auditModal = ref)}
          callback={this.handleAuditCallback}
        />
      </div>
    );
  }
}
