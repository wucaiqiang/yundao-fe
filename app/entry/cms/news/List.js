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
import EditColumnModal from "services/cms/news/editColumnModal";

import Dictionary from "model/dictionary";
import Product from "model/Product/";
import ProductCategory from "model/Product/category";
import NewsColumn from "model/CMS/News/column";
import News from "model/CMS/News/index";

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

export default class NewsColumnList extends Base {
  static get NAME() {
    return "NewsColumnList";
  }

  static get contextTypes() {
    return {data: PropTypes.object};
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[NewsColumnList.NAME]) {
      this.context = context;
    }
    this.state = {
      productCategory: [],
      declaractionModel: 2,
      filters: {
        product_level: [],
        product_risk_level: [],
        dic_product_issued_status: [],
        dic_product_examine_status: []
      }
    };
  }

  componentWillMount() {
    this.newsColumn = new NewsColumn();
    this.news = new News();
    this.dictionary = new Dictionary();

    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this
        .gridManager
        .setFilterBar(this.refs.filterBar);
    }

    this.getDictionary();
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
      .gets("dic_article_status")
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

  getColumns() {
    let {filters, productCategory} = this.state;
    const columns = [
      {
        title: "文章标题",
        dataIndex: "title",
        width: 200,
        fixed: "left",
        render: (text, record) => {
          return (
            <Link to={`/cms/news/detail/${record.id}`}>
              {text}
            </Link>
          );
        }
      }, {
        title: "平台",
        dataIndex: "platformIds",
        render: (text, record) => {
          return record.platformName;
        }
      }, {
        title: "所属栏目",
        dataIndex: "columnIds",
        render: (text, record) => {
          return record.columnName;
        }
      }, {
        title: "URL",
        dataIndex: "url",
        render: (text, record) => {
          const url = (record.platformUrl || 'www.xxx.com') + record.url;
          return record.platformUrl
            ? <a href={'//' + url} target={"_blank"}>{url}</a>
            : url
        }
      }, {
        title: "排序",
        dataIndex: "sequence",
        render: (text, record) => {
          return record.sequence;
        }
      }, {
        title: "状态",
        dataIndex: "statuss",
        render: (text, record) => {
          return filters['dic_article_status'] && filters['dic_article_status'].filter(item => item.value == record.status)[0].label;
        }
      }, {
        title: "显示阅读数",
        dataIndex: "pageview",
        render: (text, record) => {
          return record.pageview;
        }
      }, {
        title: "实际阅读数",
        dataIndex: "actualPageview",
        render: (text, record) => {
          return record.actualPageview;
        }
      }, {
        title: "发布时间",
        dataIndex: "publishDate",
        render: (text, record) => {
          return record.publishDate;
        }
      }, {
        title: "创建时间",
        dataIndex: "createDate",
        render: (text, record) => {
          return record.createDate;
        }
      }, {
        title: "操作人",
        dataIndex: "operator",
        render: (text, record) => {
          return record.operator;
        }
      }, {
        title: "更新时间",
        dataIndex: "operateTime",
        render: (text, record) => {
          return record.operateTime;
        }
      },
    ];

    return columns;
  }
  beforeLoad(params) {
    this
      .gridManager
      .makeFilterMapData();
    this.resetFilterByKey(params, "productName");
    this.resetFilterByKey(params, "productType");
    this.resetFilterByKey(params, "platformIds");
    this.resetFilterByKey(params, "positions");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "operator");
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
          .news
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
    this
      .refs[modal]
      .show(data);
  }
  render() {

    const ProductNewBtn = Permission(
      <Link to={'/cms/news/new'}>
        <Button className="btn_add">
          <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} alt=""/>
          新增文章
        </Button>
      </Link>
    );
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>内容配置</Breadcrumb.Item>
          <Breadcrumb.Item>文章内容配置</Breadcrumb.Item>
        </Breadcrumb>
        <Layout.Content>
          <div className="page-content">
            <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              url="/cms/article/get_page"
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
                  <Link to={'/cms/news/new'}>
                    <Button className="btn_add">
                      <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} alt=""/>
                      新增文章
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
        <EditColumnModal reload={this.reload} ref={ref => this.editColumnModal = ref}/>
      </Page>
    );
  }
}
