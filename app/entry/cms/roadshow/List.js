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

import ProductDetailFloat from "services/product/control/detail/productDetailFloat";

import Dictionary from "model/dictionary";
import Product from "model/Product/";
import Platform from "model/CMS/platform";
import ProductCategory from "model/Product/category";
import NewsColumn from "model/CMS/News/column";
import Roadshow from "model/CMS/Roadshow/index";

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

export default class RoadshowList extends Base {
  static get NAME() {
    return "RoadshowList";
  }

  static get contextTypes() {
    return {data: PropTypes.object};
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[RoadshowList.NAME]) {
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
    this.roadshow = new Roadshow();
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
      .gets("dic_roadshow_status")
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
        title: "路演标题",
        dataIndex: "title",
        width: 200,
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="title"
              mod={this}
              placeholder="请输入路演标题"
            />
          </div>
        ),
        render: (text, record) => {
          return (
            <Link to={`/cms/roadshow/detail/${record.id}`}>
              {text}
            </Link>
          );
        }
      }, {
        title: "平台",
        filters:platforms,
        dataIndex: "platformIds",
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
        title: "所属栏目",
        dataIndex: "columnNames",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="columnNames"
              mod={this}
              placeholder="请输入所属栏目"
            />
          </div>
        ),
        render: (text, record) => {
          return record.columnNames;
        }
      }, {
        title: "关联产品",
        dataIndex: "productName",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="productName"
              mod={this}
              placeholder="请输入关联产品"
            />
          </div>
        ),
        render: (text, record) => {
          return <a role="floatPane" onClick={()=>{
            this.showModal('productDetailFloat',{
              id:record.productId
            })
          }}>{record.productName}</a>;
        }
      }, 
      {
        title: "主讲人",
        dataIndex: "speaker",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="speaker"
              mod={this}
              placeholder="请输入主讲人"
            />
          </div>
        ),
        render: (text, record) => {
          return record.speaker;
        }
      },{
        title: "主办方",
        dataIndex: "sponsor",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="sponsor"
              mod={this}
              placeholder="请输入主办方"
            />
          </div>
        ),
        render: (text, record) => {
          return record.sponsor;
        }
      },  {
        title: "排序",
        dataIndex: "sequence",
        sorter:true,
        render: (text, record) => {
          return record.sequence;
        }
      }, {
        title: "状态",
        dataIndex: "statuss",
        filters:filters.dic_roadshow_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter
              filterKey="statuss"
              mod={this}
              placeholder="状态"
            />
          </div>
        ),
        render: (text, record) => {
          return filters['dic_roadshow_status'] && filters['dic_roadshow_status'].filter(item => item.value == record.status)[0].label;
        }
      }, {
        title: "创建时间",
        dataIndex: "createDate",
        sorter:true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
          <GridSortFilter filterKey="createDate"  mod={this}/>
          <GridDateFilter filterKey="createDate"  mod={this} />
          </div>
        ),
        render: (text, record) => {
          return  record.createDate?Utils.formatDate(record.createDate):null;
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
        title: "更新时间",
        dataIndex: "updateDate",
        sorter:true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
          <GridSortFilter filterKey="updateDate"  mod={this}/>
          <GridDateFilter filterKey="updateDate"  mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.updateDate?Utils.formatDate(record.updateDate):null;
        }
      },
    ];

    return columns;
  }
  beforeLoad(params) {
    this
      .gridManager
      .makeFilterMapData();
    this.resetFilterByKey(params, "title");
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "platformIds");
    this.resetFilterByKey(params, "columnNames");
    this.resetFilterByKey(params, "speaker");
    this.resetFilterByKey(params, "sponsor");
    this.resetFilterByKey(params, "sequence");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "updateUserName");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "updateDate");

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }

    if (params.createDate && params.createDate.length) {
      params.createDateStart = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
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
          .roadshow
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
                      .roadshow
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
    this
      .refs[modal]
      .show(data);
  }
  render() {
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>内容配置</Breadcrumb.Item>
          <Breadcrumb.Item>路演内容配置</Breadcrumb.Item>
        </Breadcrumb>
        <Layout.Content>
          <div className="page-content">
            <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              url="/roadshow/get_page"
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
                  <Link to={'/cms/roadshow/new'}>
                    <Button className="btn_add">
                      <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} alt=""/>
                      新增路演
                    </Button>
                  </Link>
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
        <ProductDetailFloat ref="productDetailFloat"/>
      </Page>
    );
  }
}
