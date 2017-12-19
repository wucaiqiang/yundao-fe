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
import EditRecommendModal from "services/cms/product/editRecommendModal";

import Dictionary from "model/dictionary";
import Product from "model/Product/";
import ProductCategory from "model/Product/category";
import Recommend from "model/CMS/Product/recommend";

import EnumProduct from "enum/enumProduct";

import Permission from "components/permission";

import style from "./Index.scss";

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

export default class ProductRecommendIndex extends Base {
  static get NAME() {
    return "ProductRecommendIndex";
  }

  static get contextTypes() {
    return {data: PropTypes.object};
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductRecommendIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      menuName: {
        text: "我对接的/助理的",
        value: "3"
      },
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
    this.product = new Product();
    this.recommend = new Recommend();
    this.productCategory = new ProductCategory();
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
    this.getProductCategory();
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
      .gets("product_level,product_risk_level,dic_product_issued_status,dic_product_examine_s" +
          "tatus")
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
  /**
   * 获取所有产品类型
   *
   * @memberof ProductNoticeIndex
   */
  getProductCategory = () => {
    this
      .productCategory
      .get_all()
      .then(res => {
        if (res.success && res.result) {
          let productCategory = res
            .result
            .map(item => {
              return {text: item.name, value: item.id};
            });
          this.setState({productCategory});
        }
      });
  };

  getColumns() {
    let {filters, productCategory} = this.state;
    const columns = [
      {
        title: "推荐编号",
        fixed: "left",
        render: (text, record) => {
          return <div className={style.operation}>
            <a onClick={() => this.editRecommendModal.show(record)}>
            {record.id}-{record.positionName}
            </a>
          </div>;
        }
      },
       {
        title: "产品类别",
        dataIndex: "productType",
        render: (text, record) => {
          return record.productType;
        }
      }, {
        title: "平台",
        dataIndex: "platformIds",
        render: (text, record) => {
          return record.platformName;
        }
      }, {
        title: "位置",
        dataIndex: "positions",
        render: (text, record) => {
          return record.positionName;
        }
      }, {
        title: "排序",
        dataIndex: "sort",
        render: (text, record) => {
          return record.sort;
        }
      },{
        title: "产品名称",
        dataIndex: "productName",
        width: 200,
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              role="floatPane"
              onClick={() => this.showModal("ProductDetailFloat", {id: record.productId})}>
              {text}
            </a>
          );
        }
      }, {
        title: "状态",
        dataIndex: "statuss",
        render: (text, record) => {
          return record.statusText;
        }
      }, {
        title: "操作人",
        dataIndex: "operator",
        render: (text, record) => {
          return record.updateUserName;
        }
      }, {
        title: "操作时间",
        dataIndex: "updateDate",
        render: (text, record) => {
          return record.updateDate
            ? Utils.formatDate(record.updateDate)
            : '--';
        }
      }
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
        console.log('ids', ids)
        return this
          .recommend
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
                  title: `您选择的产品中，以下${failList.length}个无法删除：`,
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
                        是否继续删除其他选中产品`？
                      </p>
                    </div>
                  ),
                  onOk: () => {
                    return _this
                      .product
                      .del({
                        ids: successIds.join(",")
                      })
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
                  title: "您选择的产品无法删除：", content: <div style={{
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
      <Button className="btn_add" onClick={() => this.editRecommendModal.show()}>
        <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} alt=""/>
        新增产品推荐
      </Button>
    );
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>内容配置</Breadcrumb.Item>
          <Breadcrumb.Item>产品推荐配置</Breadcrumb.Item>
        </Breadcrumb>
        <Layout.Content>
          <div className="page-content">
            <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              url="/cms/product/recommend/get_page"
              onSelect={selectData => {
              this.handleSelect(selectData);
            }}
              scroll={{
              x: "120%"
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
                  <Button className="btn_add" onClick={() => this.editRecommendModal.show()}>
                    <img src={icon_add + "@1x.png"} srcSet={icon_add + "@2x.png 2x"} alt=""/>
                    新增产品推荐
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

        <ProductDetailFloat ref="ProductDetailFloat"/>
        <EditRecommendModal
          reload={this.reload}
          ref={ref => this.editRecommendModal = ref}/>
      </Page>
    );
  }
}
