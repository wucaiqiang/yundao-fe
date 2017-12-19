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

import Base from "components/main/Base";
import Page from "components/main/Page";

import ProjectFloatPanel from "services/assets/project/detail/floatPanel";
import AuditRecordModal from "services/assets/project/auditRecordModal";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";
import Industry from "model/Project/industry";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

export default class AssetsAuditHistory extends Base {
  static get NAME() {
    return "AssetsAuditHistory";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsAuditHistory.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      filters: {
        dic_project_priority: [],
        dic_project_round: [],
        dic_decision_audit_status: [],
        dic_project_history_audit_status: [],
        dic_industry: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.industry = new Industry();

    this.getIndustry();
    this.getDictionary();
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }

  getDictionary() {
    this.dictionary
      .gets(
        "dic_project_priority,dic_project_round,dic_decision_audit_status,dic_project_history_audit_status"
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
  getColumns = () => {
    const {
        dic_project_priority,
        dic_project_round,
        dic_decision_audit_status,
        dic_project_history_audit_status,
        dic_industry
      } = this.state.filters,
      columns = [
        {
          title: "项目名称",
          dataIndex: "projectName",
          width: 200,
          fixed: "left",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="projectName" mod={this} />
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
                {record.projectName}
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
          title: "行业",
          dataIndex: "industrys",
          filters: dic_industry,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="industrys" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.industryName;
          }
        },

        {
          title: "优先级",
          dataIndex: "prioritys",
          width: 80,
          filters: dic_project_priority,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="prioritys" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.priorityText;
          }
        },
        {
          title: "审批轮次",
          dataIndex: "rounds",
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
          title: "申请人",
          dataIndex: "applyUserName",
          width: 100,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="applyUserName" mod={this} />
            </div>
          )
        },
        {
          title: "审批事项",
          width: 100,
          render: (text, record) => {
            return record.statusText;
          }
        },
        {
          title: "操作时间",
          dataIndex: "auditDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="auditDate" mod={this} />
              <GridDateFilter filterKey="auditDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD HH:mm");
          }
        },
        {
          title: "审批结果",
          dataIndex: "auditStatuss",
          filters: dic_project_history_audit_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="auditStatuss" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.auditStatusText;
          }
        },
        {
          title: "操作",
          width: 80,
          fixed: "right",
          render: (text, record) => {
            return (
              <a
                onClick={() =>
                  this.auditRecordModal.show({
                    id: record.id,
                    mode: "project"
                  })}
              >
                审批记录
              </a>
            );
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "projectName");
    this.resetFilterByKey(params, "companyName");
    this.resetFilterByKey(params, "industrys");
    this.resetFilterByKey(params, "prioritys");
    this.resetFilterByKey(params, "rounds");
    this.resetFilterByKey(params, "applyUserName");
    this.resetFilterByKey(params, "auditDate");
    this.resetFilterByKey(params, "auditStatuss");

    if (params.auditDate && params.auditDate.length) {
      params.auditStartDate = params.auditDate[0];
      params.auditEndDate = params.auditDate[1];
      delete params.auditDate;
    }

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }
    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params.sort.replace("end", "");
    }

    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key] instanceof Array) {
        if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "dateRange"
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
  reload = () => {
    this.gridManager.grid.reload();
  };
  render() {
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>审批历史</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            noRowSelection={true}
            columns={this.getColumns()}
            url="/assets/index/audit_history/get_page"
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
            <div className={`vant-filter-bar `}>
              <FilterBar gridManager={this.gridManager} ref="filterBar" />
            </div>
          </GridManager>
        </div>
        <ProjectFloatPanel ref={ref => (this.projectFloatPanel = ref)} />
        <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
      </Page>
    );
  }
}
