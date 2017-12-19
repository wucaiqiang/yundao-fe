import React from "react";
import extend from "extend";
import PropTypes from "prop-types";
import moment from "moment";

import Base from "components/main/Base";
import Page from "components/main/Page";

import {
  Breadcrumb,
  Table,
  Icon,
  Form,
  Input,
  Button,
  Modal,
  Steps,
  Layout,
  message,
  Spin
} from "antd";

import style from "./AddFund.scss";

const { Step } = Steps;

import Info from "services/assets/fund/new/info";
import Sale from "services/assets/fund/new/sale";
import Profit from "services/assets/fund/new/profit";
import Attachment from "services/assets/fund/new/attachment";
import Result from "services/assets/fund/new/result";

import Fund from "model/Assets/fund";

const steps = [
  {
    title: "基金信息",
    name: "info",
    content: Info,
    icon: <img src="/assets/images/product/产品信息@1x.png" />,
    icon_active: <img src="/assets/images/product/产品信息@1x.png" />
  },
  {
    title: "募集管理",
    name: "sale",
    content: Sale,
    icon: <img src="/assets/images/product/销售信息@1x.png" />,
    icon_active: <img src="/assets/images/product/销售信息2@1x.png" />
  },
  {
    title: "收益模式",
    name: "profit",
    content: Profit,
    icon: <img src="/assets/images/product/收益模式@1x.png" />,
    icon_active: <img src="/assets/images/product/收益模式2@1x.png" />
  },
  {
    title: "附件信息",
    name: "attachment",
    content: Attachment,
    icon: <img src="/assets/images/product/附件信息@1x.png" />,
    icon_active: <img src="/assets/images/product/附件信息2@1x.png" />
  },
  {
    title: "创建成功",
    name: "result",
    content: Result,
    icon: <img src="/assets/images/product/创建成功@1x.png" />,
    icon_active: <img src="/assets/images/product/创建成功2@1x.png" />
  }
];

class AssetsAddFund extends Base {
  static get NAME() {
    return "AssetsAddFund";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsAddFund.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: false,
      submiting: false,
      current: 0,
      data: {},
      fields: {}
    };
  }

  checkPageValidate = callback => {
    const { current } = this.state;
    return this.refs[steps[this.state.current].name].submit(callback);
  };

  updateDynamicFormFields = fields => {
    this.setState({ fields: fields });
  };

  next = () => {
    this.checkPageValidate(values => {
      if (values) {
        const prevDataName = steps[this.state.current].name;
        const current = this.state.current + 1;
        let { data } = this.state;
        data = extend(true, {}, data, values);
        console.log("formdata", data);
        if (this.state.current == steps.length - 2) {
          //倒数第二步 提交表单
          const fund = new Fund();
          data = this.formatData(data);

          this.setState({ submiting: true }, () => {
            fund.add(data).then(res => {
              this.setState({ submiting: false });
              if (res.success) {
                message.success("添加基金成功");
                data.id = res.result;
                this.setState({ current, data });
              }
            });
          });
        } else {
          this.setState({ current, data });
        }
      }
    });
  };
  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  restart = () => {
    this.setState({ current: 0, loading: true, data: {}, fields: {} });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 100);
  };

  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD");
        }
        if (v instanceof Array) {
          if (v[0] && v[0] instanceof Object && v[0]._isAMomentObject) {
            v[0] = v[0].format("YYYY-MM-DD");
          }
          if (v[1] && v[1] instanceof Object && v[1]._isAMomentObject) {
            v[1] = v[1].format("YYYY-MM-DD");
          }

          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        if (`${key}-number-1` || `${key}-number-2`) {
          delete values[`${key}-number-1`];
          delete values[`${key}-number-2`];
        }
        values[key] = v;
      }
    }

    return values;
  }

  render() {
    const { children, ...others } = this.props;
    const { current, loading, submiting, data, fields } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>投资管理</Breadcrumb.Item>
          <Breadcrumb.Item>基金</Breadcrumb.Item>
          <Breadcrumb.Item>新增基金</Breadcrumb.Item>
        </Breadcrumb>
        <div className={`page-content ${style.content}`}>
          <Steps current={current}>
            {steps.map((item, index) => (
              <Step
                key={item.title}
                key={index}
                icon={current >= index ? item.icon_active : item.icon}
                title={item.title}
              />
            ))}
          </Steps>
          <div className="steps-content">
            {loading ? (
              <Spin />
            ) : (
              steps.map((item, index) => {
                const CurrentActionComponent = steps[index].content;
                const CurrentActionComponentName = steps[index].name;

                return (
                  <div
                    key={index}
                    style={{
                      display: index == current ? "block" : "none"
                    }}
                  >
                    <CurrentActionComponent
                      data={data || {}}
                      restart={this.restart}
                      mod={this}
                      fields={fields}
                      ref={CurrentActionComponentName}
                    />
                  </div>
                );
              })
            )}
          </div>
          <div className="steps-action">
            {current > 0 &&
              current < steps.length - 1 && (
                <Button
                  style={{
                    marginLeft: 8
                  }}
                  onClick={this.prev}
                >
                  上一步
                </Button>
              )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={this.next} loading={submiting}>
                下一步
              </Button>
            )}
          </div>
        </div>
      </Page>
    );
  }
}

function Mod(props) {
  return <AssetsAddFund {...props} />;
}

export default Mod;
