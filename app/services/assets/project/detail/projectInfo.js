import React, { Component } from "react";

import ReactDOM from "react-dom";
import {
  Button,
  Icon,
  DatePicker,
  Form,
  Radio,
  Select,
  Input,
  Row,
  Col,
  message,
  Affix,
  Tooltip,
  Card,
  Cascader
} from "antd";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";
import Utils from "utils/index";

import Dictionary from "model/dictionary";

import Industry from "model/Project/industry";
import User from "model/User/index";

import style from "./projectInfo.scss";

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const NAME = "ProjectBaseInfo";

import InputEdit from "components/Form/InputEdit";

import ProjectInfoAttachment from "./projectInfoAttachment";
import EditIndustryModal from "../editIndustryModal";

import Assets from "model/Assets/index";

import { generatorEditForm } from "components/Form/SingleEditForm";

class ProjectBaseInfo extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.assets = new Assets();
    this.dictionary = new Dictionary();
    this.industry = new Industry();
    this.user = new User();
    this.getDictionary();
    this.loadAllUsers();
    this.loadRegion();
  }
  state = {
    isEdit: false,
    filters: {}
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.id != this.props.data.id) {
      this.setState({ isEdit: false });
    }
  }

  getDictionary() {
    this.dictionary
      .gets(
        "dic_project_source,dic_currency,dic_project_investment_source,dic_project_priority"
      )
      .then(res => {
        if (res.success && res.result) {
          let { filters } = this.state;
          res.result.map(item => {
            filters[item.value] = item.selections;
          });

          this.setState({ filters });
        }
      });
    this.loadIndustry();
  }

  loadIndustry = () => {
    this.industry.gets().then(res => {
      if (res.success) {
        let { filters } = this.state;

        filters["dic_industry"] = res.result;

        this.setState({ filters });
      }
    });
  };

  loadRegion = () => {
    const _this = this;
    require.ensure(["../../../../const/citys"], () => {
      const dic_region = require("../../../../const/citys").default;
      let { filters } = _this.state;
      filters["dic_region"] = dic_region;
      console.log("filters", filters);
      _this.setState({ filters });
    });
  };

  loadAllUsers = () => {
    this.user.get_users().then(res => {
      if (res.success) {
        let { filters } = this.state;

        filters["dic_users"] = res.result.map(item => {
          return {
            label: item.realName,
            value: item.id.toString(),
            mobile: item.mobile
          };
        });

        this.setState({ filters });
      }
    });
  };

  /**
   * 编辑行业领域弹框回调
   */
  handleIndustryCallback = industry => {
    let { filters } = this.state;
    let { mod } = this.props;

    filters["dic_industry"] = industry;
    //更新行业领域数据
    this.setState({ filters });

    //更新数据
    mod.reload && mod.reload();
  };

  render() {
    const { data = {}, mod } = this.props;
    if (!data) {
      return null;
    }

    //无编辑权限 同时状态是已取消,已作废,已退款
    const canEdit = data.permission.editPermission;

    const canRead = data.permission.readPermission;

    let info = JSON.parse(JSON.stringify(data.data));

    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const {
      dic_project_source,
      dic_currency,
      dic_project_priority,
      dic_industry,
      dic_users,
      dic_region
    } = this.state.filters;

    const GroupLeaderSelect = generatorEditForm(
      Select,
      {
        size: "large",
        getPopupContainer: () => document.getElementById(NAME),
        labelInValue: true,
        showSearch: true,
        placeholder: "请选择项目负责人",
        optionFilterProp: "children",
        events: ["onChange", "onBlur"],
        filterOption: (input, option) =>
          option.props.children
            .toString()
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0,
        formatView: value => {
          const user =
            dic_users && dic_users.filter(item => item.value == value.key)[0];
          return value && user ? `${user.label}(${user.mobile})` : null;
        },
        formatSubmit: value =>
          value
            ? {
                id: info.id,
                name: "leaderId",
                value: value.key
              }
            : {},
        style: {
          width: "100%"
        },
        canEdit,
        children:
          dic_users &&
          dic_users.map(item => {
            return (
              <Option key={item.value}>
                {item.label}({item.mobile})
              </Option>
            );
          })
      },
      [
        {
          required: true,
          message: "请选择项目负责人"
        }
      ]
    );
    const GroupUserSelect = generatorEditForm(
      Select,
      {
        size: "large",
        mode: "multiple",
        getPopupContainer: () => document.getElementById(NAME),
        labelInValue: true,
        optionFilterProp: "children",
        filterOption: (input, option) =>
          option.props.children
            .toString()
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0,
        showSearch: true,
        allowClear: true,
        events: ["onBlur"],
        canEdit,
        placeholder: "请选择项目组成员",
        formatView: value =>
          value && value.length
            ? dic_users &&
              dic_users
                .filter(
                  item =>
                    value.map(item => item.key).indexOf(item.value) > -1
                      ? true
                      : false
                )
                .map(item => item.label)
                .join(",")
            : null,
        formatSubmit: value =>
          value && value.length
            ? {
                projectId: info.id,
                userIds: value.map(item => item.key).join(",")
              }
            : {
                projectId: info.id,
                userIds: ""
              },
        style: {
          width: "100%"
        },
        children:
          dic_users &&
          dic_users.map(item => {
            return (
              <Option key={item.value}>
                {item.label}({item.mobile})
              </Option>
            );
          })
      },
      [
        {
          type: "array",
          message: "最多可选50个成员",
          max: 50
        }
      ]
    );

    const ProjectName = generatorEditForm(
      Input,
      {
        size: "large",
        placeholder: "请输入项目名称",
        canEdit,
        formatSubmit: value => {
          return {
            id: info.id,
            name: "name",
            value: value
          };
        },
        style: {
          width: "100%"
        }
      },
      [
        {
          required: true,
          type: "string",
          whitespace: true,
          message: "请填写长度不超过50个字符的项目名称",
          min: 1,
          max: 50
        }
      ]
    );

    const Description = generatorEditForm(
      Input,
      {
        size: "large",
        formatSubmit: value => {
          return {
            id: info.id,
            name: "description",
            value: value
          };
        },
        formatView: value =>
          value ? <span style={{ lineHeight: "20px" }}>{value}</span> : null,
        placeholder: "请输入项目介绍",
        canEdit,
        style: {
          width: "100%"
        }
      },
      [
        {
          type: "string",
          whitespace: true,
          message: "请填写长度不超过200个字符的项目介绍",
          min: 1,
          max: 200
        }
      ]
    );

    const Remark = generatorEditForm(
      Input,
      {
        size: "large",
        formatSubmit: value => {
          return {
            id: info.id,
            name: "remark",
            value: value
          };
        },
        formatView: value =>
          value ? <span style={{ lineHeight: "20px" }}>{value}</span> : null,
        placeholder: "请输入备注",
        canEdit,
        style: {
          width: "100%"
        }
      },
      [
        {
          type: "string",
          whitespace: true,
          message: "请填写长度不超过200个字符的备注",
          min: 1,
          max: 200
        }
      ]
    );
    const UrlForm = generatorEditForm(
      Input,
      {
        size: "large",
        placeholder: "请输入主页链接",
        canEdit,
        formatView: value =>
          value ? (
            <a href={value.indexOf('://')>-1?value:'http://'+value} style={{ lineHeight: "20px" }} target="_blank">
              {value}
            </a>
          ) : null,
        formatSubmit: value => {
          return {
            id: info.id,
            name: "url",
            value: value
          };
        },
        style: {
          width: "100%"
        }
      },
      [
        {
          type: "string",
          whitespace: true,
          message: "请填写长度不超过200个字符的主页链接",

          min: 1,
          max: 200
        }
      ]
    );
    const Source = generatorEditForm(Select, {
      size: "large",
      getPopupContainer: () => document.getElementById(NAME),
      labelInValue: true,
      placeholder: "请选择来源",
      formatView: value => (value ? value.label : null),
      allowClear: true,
      formatSubmit: value => {
        return {
          id: info.id,
          name: "source",
          value: value ? value.key : null
        };
      },
      canEdit,
      events: ["onChange", "onBlur"],
      style: {
        width: "100%"
      },
      children:
        dic_project_source &&
        dic_project_source.map(item => {
          return <Option key={item.value}>{item.label}</Option>;
        })
    });
    const Currency = generatorEditForm(Select, {
      size: "large",
      allowClear: true,
      getPopupContainer: () => document.getElementById(NAME),
      labelInValue: true,
      placeholder: "请选择币种",
      formatView: value => (value ? value.label : null),
      formatSubmit: value => {
        return {
          id: info.id,
          name: "currency",
          value: value ? value.key : null
        };
      },
      canEdit,
      style: {
        width: "100%"
      },
      events: ["onChange", "onBlur"],
      children:
        dic_currency &&
        dic_currency.map(item => {
          return <Option key={item.value}>{item.label}</Option>;
        })
    });

    const Priority = generatorEditForm(Select, {
      size: "large",
      allowClear: true,
      getPopupContainer: () => document.getElementById(NAME),
      labelInValue: true,
      placeholder: "请选择优先级",

      events: ["onChange", "onBlur"],
      formatView: value => (value ? value.label : null),
      formatSubmit: value => {
        return {
          id: info.id,
          name: "priority",
          value: value ? value.key : null
        };
      },
      canEdit,
      style: {
        width: "100%"
      },
      children:
        dic_project_priority &&
        dic_project_priority.map(item => {
          return <Option key={item.value}>{item.label}</Option>;
        })
    });
    const IndustryForm = generatorEditForm(Select, {
      size: "large",
      allowClear: true,
      getPopupContainer: () => document.getElementById(NAME),
      labelInValue: true,
      placeholder: "请选择行业领域",
      events: ["onChange", "onBlur"],
      formatView: value => (value ? value.label : null),
      formatSubmit: value => {
        return {
          id: info.id,
          name: "industryId",
          value: value ? value.key : null
        };
      },
      canEdit,
      style: {
        width: "100%"
      },
      children:
        dic_industry &&
        dic_industry.map(item => {
          return <Option key={item.value}>{item.label}</Option>;
        })
    });

    const Region = generatorEditForm(Cascader, {
      getPopupContainer: () => document.getElementById(NAME),
      options: dic_region,
      placeholder: "请选择地域",
      canEdit,
      allowClear: true,
      formatView: value => {
        const province =
          value && dic_region
            ? dic_region.filter(item => item.value == value[0])[0]
            : null;
        return province
          ? `${province.label}/${
              province.children.filter(item => item.value == value[1])[0].label
            }`
          : null;
      },
      events: ["onChange"],
      formatSubmit: value => {
        console.log("value", value);
        const params = [];
        params.push({
          id: info.id,
          name: "provinceCode",
          value: value && value[0] ? value[0] : null
        });
        params.push({
          id: info.id,
          name: "cityCode",
          value: value && value[1] ? value[1] : null
        });
        return {
          data: JSON.stringify(params)
        };
      },
      changeOnSelect: false,
      expandTrigger: "hover",
      size: "large"
    });

    const icons = [];
    return (
      <div className={style.content} id={NAME}>
        <Row>
          <Col span="14">
            <Card
              title="项目信息"
              bordered={false}
              style={{
                marginRight: "24px"
              }}
            >
              <div className={style.content}>
                <Row>
                  <Col
                    span={12}
                    style={{
                      paddingRight: 20
                    }}
                  >
                    <ProjectName
                      label="项目名称"
                      onChange={value => {
                        mod.reload();
                      }}
                      request={this.assets.update_only}
                      data={{
                        id: info.id,
                        name: "name",
                        value: info.name
                      }}
                    />
                    <FormItem label="最新投决轮次" {...formItemLayout}>
                      {info && info.roundText ? `${info.roundText}` : "暂无"}
                    </FormItem>
                    <FormItem label="当前轮次估值" {...formItemLayout}>
                      {info && info.valuation ? `${info.valuation}万` : "暂无"}
                    </FormItem>
                    <Source
                      label="来源"
                      request={this.assets.update_only}
                      data={{
                        id: info.id,
                        name: "source",
                        value:
                          info.source !== undefined || info.source !== null
                            ? {
                                label: info.sourceText,
                                key: info.source
                              }
                            : {}
                      }}
                      onChange={res => {
                        mod.reload();
                      }}
                    />
                    <Region
                      label="地域"
                      request={this.assets.update_multiple}
                      data={{
                        id: info.id,
                        name: "address",
                        value: info.provinceCode
                          ? [info.provinceCode, info.cityCode]
                          : []
                      }}
                      onChange={res => {
                        mod.reload();
                      }}
                    />
                    <Description
                      label="项目介绍"
                      request={this.assets.update_only}
                      data={{
                        id: info.id,
                        name: "description",
                        value: info.description
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <FormItem label="行业领域" {...formItemLayout}>
                      <div className={style.industry}>
                        <div style={{ flex: 1, marginRight: 10 }}>
                          <IndustryForm
                            request={this.assets.update_only}
                            onChange={res => {
                              mod.reload();
                            }}
                            data={{
                              id: info.id,
                              name: "industryId",
                              value:
                                info.industryId !== undefined ||
                                info.industryId !== null
                                  ? {
                                      label: info.industryText,
                                      key: info.industryId
                                    }
                                  : {}
                            }}
                          />
                        </div>
                        {canEdit ? (
                          <Button
                            className="ant-btn-plus"
                            onClick={() => this.editIndustryModal.show()}
                          >
                            <Icon type="plus" />
                          </Button>
                        ) : null}
                      </div>
                    </FormItem>
                    <FormItem label="项目状态" {...formItemLayout}>
                      {info && info.statusText}
                    </FormItem>

                    <Currency
                      label="估值币种"
                      request={this.assets.update_only}
                      data={{
                        id: info.id,
                        name: "currency",
                        value:
                          info.currency !== undefined || info.currency !== null
                            ? {
                                label: info.currencyText,
                                key: info.currency
                              }
                            : {}
                      }}
                    />
                    <Priority
                      label="优先级"
                      request={this.assets.update_only}
                      onChange={res => {
                        mod.reload();
                      }}
                      data={{
                        id: info.id,
                        name: "priority",
                        value:
                          info.priority !== undefined || info.priority !== null
                            ? {
                                label: info.priorityText,
                                key: info.priority
                              }
                            : {}
                      }}
                    />
                    <UrlForm
                      label="主页链接"
                      request={this.assets.update_only}
                      data={{
                        id: info.id,
                        name: "url",
                        value: info.url
                      }}
                    />
                    <Remark
                      label="备注"
                      request={this.assets.update_only}
                      data={{
                        id: info.id,
                        name: "remark",
                        value: info.remark
                      }}
                    />
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span="10">
            <Card
              title="负责团队"
              style={{ marginBottom: 20 }}
              bordered={false}
            >
              <div className={style.content}>
                <GroupLeaderSelect
                  label="项目负责人"
                  request={this.assets.update_only}
                  data={{
                    id: info.id,
                    name: "leaderId",
                    value: info.leaderId
                      ? {
                          key: info.leaderId,
                          label: dic_users
                            ? `${
                                dic_users.filter(
                                  i => i.value == info.leaderId
                                )[0].label
                              }(${
                                dic_users.filter(
                                  i => i.value == info.leaderId
                                )[0].mobile
                              })`
                            : null
                        }
                      : {}
                  }}
                />
                <GroupUserSelect
                  label="项目组成员"
                  request={this.assets.project_crew_update}
                  data={{
                    id: info.id,
                    name: "crewIds",
                    value: info.crewIds
                      ? info.crewIds.split(",").map((item, index) => {
                          let label = null;
                          if (dic_users) {
                            const user = dic_users.filter(
                              i => i.value == item
                            )[0];
                            label = `${user.label}(${user.mobile})`;
                          }
                          return {
                            key: item,
                            label: label
                          };
                        })
                      : []
                  }}
                />
              </div>
            </Card>
            <ProjectInfoAttachment data={data} />
          </Col>
        </Row>
        {dic_industry ? (
          <EditIndustryModal
            industry={dic_industry}
            ref={ref => (this.editIndustryModal = ref)}
            callback={this.handleIndustryCallback}
          />
        ) : null}
      </div>
    );
  }
}

ProjectBaseInfo = Form.create()(ProjectBaseInfo);

export default ProjectBaseInfo;
