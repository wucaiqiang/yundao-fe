import React from "react";
import ReactDom from "react-dom";
import extend from "extend";
import PropTypes from "prop-types";

import {Link} from "react-router-dom";

import {
  Breadcrumb,
  Icon,
  Select,
  Button,
  Layout,
  Popover,
  Popconfirm,
  Dropdown,
  message,
  Menu,
  Modal,
  Radio
} from "antd";

const RadioGroup = Radio.Group;

import Base from "components/main/Base";
import Page from "components/main/Page";

import Utils from "utils/";
import GM from "lib/gridManager";

import EditColumnModal from "services/cms/roadshow/editColumnModal";

import Dictionary from "model/dictionary";
import Product from "model/Product/";
import Platform from "model/CMS/platform";
import RoadshowColumn from "model/CMS/Roadshow/column";

import EnumProduct from "enum/enumProduct";

import Permission from "components/permission";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridRangeFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

const {Option} = Select;

const {EnumProductStatus} = EnumProduct;

const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";
const icon_question = "/assets/images/icon/问号";

export default class RoadshowColumnList extends Base {
  static get NAME() {
    return "RoadshowColumnList";
  }

  static get contextTypes() {
    return {data: PropTypes.object};
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[RoadshowColumnList.NAME]) {
      this.context = context;
    }
    this.state = {
      productCategory: [],
      declaractionModel: 2,
      platforms:[],
      filters: {
        product_level: [],
        product_risk_level: [],
        dic_product_issued_status: [],
        dic_product_examine_status: []
      }
    };
  }

  componentWillMount() {
    this.roadshowColumn = new RoadshowColumn();
    this.dictionary = new Dictionary();
    this.platform = new Platform();

    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this
        .gridManager
        .setFilterBar(this.refs.filterBar);
    }

    this.getDictionary();
    this.get_platform()
  }
  getFloatToolsBarCls() {
    let cls;

    cls = ["vant-float-bar"];
    if (this.state.selectRowsCount) {
      cls.push("open");
    }
    return cls.join(" ");
  }
  getDictionary() {
    this
      .dictionary
      .gets("dic_roadshow_column_status")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res
            .result
            .map(item => {
              filters[item.value] = item.selections;
            });

          this.setState({filters});
        }
      });
  }

  get_platform = () => {
    return this
      .platform
      .get_roadshow_platform()
      .then(res => {
        this.setState({platforms: res.result.map(item=>{
          return {
            label:item.name,
            value:item.id
          }
        })})
      })
  }

  getColumns() {
    let {filters, productCategory,platforms} = this.state;
    const columns = [
      {
        title: "栏目名称",
        dataIndex: "name",
        width: 200,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="name"
              mod={this}
              placeholder="请输入栏目名称"
            />
          </div>
        ),
        fixed: "left",
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              role="floatPane"
              onClick={() => this.showModal("editColumnModal", record)}>
              {text}
            </a>
          );
        }
      }, {
        title: "平台",
        dataIndex: "platformIds",
        filters:platforms,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter
              filterKey="platformIds"
              mod={this}
              placeholder="平台"
            />
          </div>
        ),
        render: (text, record) => {
          return record.platformName;
        }
      }, {
        title: "排序",
        dataIndex: "sequence",
        sorter:true,
        render: (text, record) => {
          return record.sequence;
        }
      }, {
        title: "状态",
        dataIndex: "statuss",
        filters:filters.dic_roadshow_column_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter
              filterKey="statuss"
              mod={this}
              placeholder="请输入视频名称"
            />
          </div>
        ),
        render: (text, record) => {
          return record.statusText
        }
      }, {
        title: "操作人",
        dataIndex: "updateUserName",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="updateUserName"
              mod={this}
              placeholder="请输入操作人"
            />
          </div>
        ),
        render: (text, record) => {
          return record.updateUserName;
        }
      }, {
        title:"更新时间",
        dataIndex: "updateDate",
        sorter:true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
          <GridSortFilter filterKey="updateDate"  mod={this}/>
          <GridDateFilter filterKey="updateDate"  mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(record.updateDate);
        }
      }
    ];

    return columns;
  }
  beforeLoad(params) {
    this
      .gridManager
      .makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "platformIds");
    this.resetFilterByKey(params, "columnNames");
    this.resetFilterByKey(params, "sequence");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "updateUserName");
    this.resetFilterByKey(params, "updateDate");

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }

    if (params.updateDate && params.updateDate.length) {
      params.updateDateStart = params.updateDate[0];
      params.updateDateEnd = params.updateDate[1];
      delete params.updateDate;
    }

    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params
        .sort
        .replace("end", "");
    }

    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key]instanceof Array) {
        if (params[key].length === 1 && ["numberRange", "dateRange"].indexOf(params[key][0].filterType) > -1) {
          params[key] = params[key][0].values;
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
    let {
      selectIds,
      selectRowsCount = 0,
      selectRowsData
    } = selectData;
    this.setState({selectIds, selectRowsCount, selectRowsData});
  }

  reload = () => {
    this
      .gridManager
      .grid
      .reload();
  }

  handleDelete = () => {
    let {selectIds} = this.state,
      _this = this,
      ids = selectIds.join(",");

    Modal.confirm({
      width: 350,
      title: "删除后不可撤回，确定吗?",
      onOk: () => {
        return this
          .roadshowColumn
          .delete(ids)
          .then(res => {
            const {
              failList = [],
              passList = []
            } = res.result || {};
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
                  messages[item.code]
                    .name
                    .push(item.name);
                }
              });

              for (var key in messages) {
                if (messages.hasOwnProperty(key)) {
                  let item = messages[key];
                  messageContent.push(
                    <div key={`message_${key}`}>
                      <p>{`${item.message}:`}</p>
                      <p>{item
                          .name
                          .join("、")}</p>
                    </div>
                  );
                }
              }

              if (successIds.length > 0) {
                Modal.confirm({
                  width: 460,
                  title: `您选择的栏目中，以下${failList.length}个无法删除：`,
                  content: (
                    <div>
                      <div
                        style={{
                        paddingTop: 15,
                        paddingBottom: 15
                      }}>
                        {messageContent}
                      </div>
                      <p style={{
                        fontSize: "14px"
                      }}>
                        是否继续删除其他选中栏目`？
                      </p>
                    </div>
                  ),
                  onOk: () => {
                    return _this
                      .newsColumn
                      .delete(successIds.join(","))
                      .then(res => {
                        if (res.success) {
                          message.success("删除成功");
                          this.reload()
                        }
                      });
                  }
                });
              } else {
                _this.gridManager.clearRowSelect()
                // _this.setState({selectRowsCount: 0, selectIds: []});

                //错误同一个原因时
                if (messageContent.length === 1) {
                  messageContent = <p>{failList[0].message}</p>;
                }

                Modal.info({
                  title: "您选择的栏目无法删除：", content: <div style={{
                    paddingTop: 15
                  }}>{messageContent}</div>,
                  okText: "确定"
                });
              }
            } else if (res.success) {
              message.success("删除成功");
              this.reload()
            }
          });
      }
    });
  };
  showModal(modal, data) {
    this[modal].show(data);
  }
  render() {

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>内容配置</Breadcrumb.Item>
          <Breadcrumb.Item>路演栏目配置</Breadcrumb.Item>
        </Breadcrumb>
        <Layout.Content>
          <div className="page-content">
            <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              url="/roadshow/column/get_page"
              onSelect={selectData => {
              this.handleSelect(selectData);
            }}
              columns={this.getColumns()}
              beforeLoad={params => {
              return this.beforeLoad(params);
            }}
              mod={this}
              ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}>
              <div className={`vant-filter-bar clearfix`}>
                <div className="fl">
                  <FilterBar gridManager={this.gridManager} ref="filterBar"/>
                </div>
                <div className="vant-filter-bar-action fr">
                  <Button className="btn_add" onClick={() => this.editColumnModal.show()}>
                    <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} alt=""/>
                    新增栏目
                  </Button>
                </div>
                <div className={this.getFloatToolsBarCls()}>
                  已选中
                  <span className="count">{this.state.selectRowsCount}</span>
                  项
                  <span className="separator">|</span>
                  <a className="ant-btn-link" onClick={this.handleDelete}>
                    <Icon type="delete"/>删除
                  </a>
                </div>
              </div>
            </GridManager>
          </div>
        </Layout.Content>
        <EditColumnModal reload={this.reload} ref={ref => this.editColumnModal = ref}/>
      </Page>
    );
  }
}
