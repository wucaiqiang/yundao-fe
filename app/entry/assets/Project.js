import React from "react";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Select,
  Tooltip,
  message
} from "antd";
import ClassNames from "classnames";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import EditProjectModal from "services/assets/project/editProjectModal";
import ProjectFloatPanel from "services/assets/project/detail/floatPanel";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";
import Assets from "model/Assets/index";
import Industry from "model/Project/industry";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridCitysFilter,
  GridRangeFilter
} = GM;

const icon_add = "/assets/images/icon/新增";

export default class AssetsProject extends Base {
  static get NAME() {
    return "AssetsProject";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsProject.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      disabledAutoLoad: true,
      menuName: {
        code: "all"
      },
      scope: [],
      filters: {
        dic_project_round: [],
        dic_project_status: [],
        dic_project_priority: [],
        dic_project_source: [],
        dic_industry: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.industry = new Industry();
    this.assets = new Assets();

    this.getScope();
    this.getDictionary();
    this.getIndustry();
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }

  getDictionary() {
    this.dictionary
      .gets("dic_project_round,dic_project_priority,dic_project_source")
      .then(res => {
        if (res.success && res.result) {
          let { filters } = this.state;

          res.result.map(item => {
            filters[item.value] = item.selections;
          });

          this.setState({ filters });
        }
      });
  }
  /**
   * 获取行业领域
   */
  getIndustry() {
    this.industry.gets().then(res => {
      if (res.success) {
        let { filters } = this.state;

        filters["dic_industry"] = res.result;

        this.setState({ filters });
      }
    });
  }

  /**
   * 获取左上角搜索范围
   */
  getScope() {
    let { filters } = this.state;

    this.assets.getScope().then(res => {
      if (res.success && res.result.length > 0) {
        filters.dic_project_status = res.result[0].statuss;

        this.setState({
          filters,
          scope: res.result,
          menuName: res.result[0]
        });
      }
    });
  }
  getAreaText(record) {
    if (record.provinceText && record.cityText) {
      return `${record.provinceText}/${record.cityText}`;
    } else if (!record.provinceText) {
      return record.cityText;
    } else if (!record.cityText) {
      return record.provinceText;
    } else {
      return null;
    }
  }
  getColumns = () => {
    const {
        dic_project_round,
        dic_project_status,
        dic_project_priority,
        dic_project_source,
        dic_industry
      } = this.state.filters,
      columns = [
        {
          title: "项目名称",
          dataIndex: "name",
          width: 200,
          fixed: "left",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="name" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return (
              <a
                role="floatPane"
                onClick={e => {
                  this.projectFloatPanel.show(record);
                }}
              >
                {record.name}
              </a>
            );
          }
        },
        {
          title: "公司",
          dataIndex: "companyName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="companyName" mod={this} />
            </div>
          )
        },
        {
          title: "优先级",
          dataIndex: "prioritys",
          sorter: true,
          filters: dic_project_priority,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="prioritys" mod={this} />
              <GridCheckboxFilter
                filterKey="prioritys"
                mod={this}
                placeholder="请输入正确手机号"
              />
            </div>
          ),
          render: (text, record) => {
            return record.priorityText;
          }
        },

        {
          title: "最新轮次",
          dataIndex: "rounds",
          width: 100,
          filters: dic_project_round,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="rounds" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.roundText;
          }
        },
        {
          title: "最新状态",
          dataIndex: "statuss",
          filters: dic_project_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="statuss" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.statusText;
          }
        },
        {
          title: "当前轮次出资金额",
          dataIndex: "investmentAmount",
          width: 160,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="investmentAmount" mod={this} />
              <GridRangeFilter filterKey="investmentAmount" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.investmentAmount
              ? `${record.investmentAmount}万`
              : null;
          }
        },
        {
          title: "当前轮次占股",
          dataIndex: "shareRatio",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="shareRatio" mod={this} />
              <GridRangeFilter filterKey="shareRatio" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.shareRatio ? `${record.shareRatio}%` : null;
          }
        },

        {
          title: "当前轮次估值",
          dataIndex: "valuation",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="valuation" mod={this} />
              <GridRangeFilter filterKey="valuation" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.valuation ? `${record.valuation}万` : null;
          }
        },
        {
          title: "地域",
          dataIndex: "cityCodes",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCitysFilter filterKey="cityCodes" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return this.getAreaText(record);
          }
        },
        {
          title: "行业",
          dataIndex: "industryIds",
          width: 130,
          filters: dic_industry,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="industryIds" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.industry;
          }
        },
        {
          title: "来源",
          dataIndex: "sources",
          width: 130,
          filters: dic_project_source,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="sources" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.sourceText;
          }
        },
        {
          title: "负责人",
          dataIndex: "leaderName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="leaderName" mod={this} />
            </div>
          )
        },
        {
          title: "创建日期",
          dataIndex: "createDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="createDate" mod={this} />
              <GridDateFilter filterKey="createDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "companyName");
    this.resetFilterByKey(params, "prioritys");
    this.resetFilterByKey(params, "rounds");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "investmentAmount");
    this.resetFilterByKey(params, "shareRatio");
    this.resetFilterByKey(params, "valuation");
    this.resetFilterByKey(params, "cityCodes");
    this.resetFilterByKey(params, "industryIds");
    this.resetFilterByKey(params, "sources");
    this.resetFilterByKey(params, "leaderName");
    this.resetFilterByKey(params, "createDate");

    if (params.investmentAmount && params.investmentAmount.length) {
      params.investmentAmountBegin = params.investmentAmount[0];
      params.investmentAmountEnd = params.investmentAmount[1];
      delete params.investmentAmount;
    }

    if (params.shareRatio && params.shareRatio.length) {
      params.shareRatioBegin = params.shareRatio[0];
      params.shareRatioEnd = params.shareRatio[1];
      delete params.shareRatio;
    }

    if (params.valuation && params.valuation.length) {
      params.valuationBegin = params.valuation[0];
      params.valuationEnd = params.valuation[1];
      delete params.valuation;
    }

    if (params.cityCodes && params.cityCodes.length) {
      params.cityCodes = params.cityCodes.join(",");
    }

    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }
    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder.replace("end", "");
      }
      delete params.sortOrder;
    }

    params.scope = this.state.menuName.code;

    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key] instanceof Array) {
        if (
          params[key].length === 1 &&
          ["dateRange", "numberRange"].indexOf(params[key][0].filterType) > -1
        ) {
          params[key] = params[key][0].values;
        } else if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "citys"
        ) {
          params[key] = params[key][0].values.value;
        } else {
          params[key] = params[key].join(",");
        }
      }
      if (params[key] != "") {
        if (newKey) {
          params[newKey] = params[key];
          delete params[key];
        }
      }
    }
    return params;
  }
  handleSelect(selectData) {
    this.setState({ ...selectData });
  }
  handleMenuClick = e => {
    let menuName = {
      name: e.item.props.children,
      code: e.key
    };

    let { scope, filters } = this.state;

    filters.dic_project_status = scope.find(
      item => item.code === e.key
    ).statuss;

    this.setState({ menuName, filters }, () => {
      this.gridManager.grid.reload();
    });
  };
  reload = () => {
    this.gridManager.grid.reload();
  };
  handleEditModal = () => {
    this.editProjectModal.show();
  };
  /**
   * 刷新行业领域
   */
  handleCallbackIndustry = data => {
    let { filters } = this.state;
    filters.dic_industry = data;

    this.setState(filters);
  };
  handleFollow = () => {
    const { selectIds } = this.state;
    let ids = selectIds.join(",");

    this.assets.focus(ids).then(res => {
      if (res.success) {
        this.gridManager.clearRowSelect();
        message.success("关注成功");
      }
    });
  };
  handleDel = () => {
    const _this = this;
    const { selectIds } = this.state;

    let ids = selectIds.join(",");

    Modal.confirm({
      width: 420,
      title: "确定删除选中项目?",
      onOk() {
        return _this.assets.delete(ids).then(res => {
          const { failList = [], passList = [] } = res.result || {};
          if (failList && failList.length) {
            let successIds = [],
              messageContent = [],
              messages = {};

            passList.map(item => {
              successIds.push(item.id);
            });

            //汇总错误信息
            failList.map(item => {
              if (!messages[item.code]) {
                messages[item.code] = {
                  message: item.message,
                  name: [item.name]
                };
              } else {
                messages[item.code].name.push(item.name);
              }
            });

            for (var key in messages) {
              if (messages.hasOwnProperty(key)) {
                let item = messages[key];
                messageContent.push(
                  <div key={`message_${key}`}>
                    <p>{`${item.message}:`}</p>
                    <p>{item.name.join("、")}</p>
                  </div>
                );
              }
            }

            //有可删除的才两次删除
            if (successIds.length > 0) {
              Modal.confirm({
                width: 460,
                title: `您选择的项目中，以下${failList.length}个无法删除`,
                content: (
                  <div>
                    <div
                      style={{
                        paddingTop: 15,
                        paddingBottom: 15
                      }}
                    >
                      {messageContent}
                    </div>
                    <p
                      style={{
                        fontSize: "14px"
                      }}
                    >
                      是否继续删除其他选中项目？
                    </p>
                  </div>
                ),
                onOk() {
                  return _this.assets.delete(successIds.join(",")).then(res => {
                    if (res.success) {
                      message.success("删除成功");
                      _this.gridManager.grid.reload();
                    }
                  });
                }
              });
            } else {
              _this.gridManager.clearRowSelect();

              //错误同一个原因时
              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的项目无法删除：",
                content: (
                  <div
                    style={{
                      paddingTop: 15
                    }}
                  >
                    {messageContent}
                  </div>
                ),
                okText: "确定"
              });
            }
          } else if (res.success) {
            message.success("删除成功");
            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };
  render() {
    let { menuName, selectRowsCount, filters, scope } = this.state;

    const PermissionButton = Permission(
      <Button className={"btn_add"} onClick={this.handleEditModal}>
        <img src={icon_add + "@1x.png"} />
        新增项目
      </Button>
    );

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>投资管理</Breadcrumb.Item>
          <Breadcrumb.Item>项目</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/assets/project/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "100%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  className={style.drop_menu}
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      {scope &&
                        scope.map(item => {
                          return (
                            <Menu.Item key={item.code}>{item.name}</Menu.Item>
                          );
                        })}
                    </Menu>
                  }
                >
                  <a className={`ant-dropdown-link ${style.title}`}>
                    {menuName.name}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </div>
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                <PermissionButton auth="assets.project.add" />
              </div>

              <div
                className={ClassNames({
                  "vant-float-bar": true,
                  open: selectRowsCount
                })}
              >
                已选中
                <span className="count">{selectRowsCount}</span>
                项
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.handleFollow}>
                  <Icon type="heart-o" />关注
                </a>
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.handleDel}>
                  <Icon type="delete" />删除
                </a>
              </div>
            </div>
          </GridManager>

          <EditProjectModal
            ref={ref => (this.editProjectModal = ref)}
            industry={filters.dic_industry}
            source={filters.dic_project_source}
            reload={this.reload}
            callback={this.handleCallbackIndustry}
          />
        </div>
        <ProjectFloatPanel
          root={this}
          ref={ref => (this.projectFloatPanel = ref)}
        />
      </Page>
    );
  }
}
