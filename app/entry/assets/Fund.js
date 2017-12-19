import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

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
import Permission from "components/permission";

import ClassNames from "classnames";
import GM from "lib/gridManager";

import Utils from "utils/";

import FundFloatPane from "services/assets/fund/detail/fundFloatPane";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import ImportProductModal from "services/assets/importProductModal";

import Dictionary from "model/dictionary";
import ProductCategory from "model/Product/category";
import Fund from "model/Assets/fund";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridRangeFilter
} = GM;

const icon_add = "/assets/images/icon/新增";

export default class AssetsFund extends Base {
  static get NAME() {
    return "AssetsFund";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsFund.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "全部基金",
        value: "all"
      },
      productCategory: [],
      filters: {
        product_level: [],
        product_risk_level: [],
        dic_fund_issued_status: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.productCategory = new ProductCategory();
    this.fund = new Fund();

    this.getDictionary();
    this.getProductCategory();
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    window.productFloatPane = this.productDetailFloat;
  }

  getDictionary() {
    this.dictionary
      .gets("product_level,product_risk_level,dic_fund_issued_status")
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
   * 获取所有基金类型
   *
   */
  getProductCategory = () => {
    this.productCategory.get_all().then(res => {
      if (res.success && res.result) {
        let productCategory = res.result.map(item => {
          return { text: item.name, value: item.id };
        });
        this.setState({ productCategory });
      }
    });
  };
  getColumns = () => {
    const {
        filters: {
          dic_sex,
          product_level,
          product_risk_level,
          dic_fund_issued_status
        },
        productCategory
      } = this.state,
      columns = [
        {
          title: "基金名称",
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
                role="customerName"
                onClick={e => {
                  this.fundFloatPane.show(record);
                }}
              >
                {record.name}
              </a>
            );
          }
        },
        {
          title: "基金类别",
          dataIndex: "typeIds",
          filters: productCategory,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="typeIds" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.typeName;
          }
        },
        {
          title: "基金等级",
          dataIndex: "levels",
          filters: product_level,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="levels" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.levelText;
          }
        },

        {
          title: "风险等级",
          dataIndex: "riskLevels",
          filters: product_risk_level,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="riskLevels" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.riskLevelText;
          }
        },
        {
          title: "募集规模",
          dataIndex: "productScale",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="productScale" mod={this} />
              <GridRangeFilter filterKey="productScale" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return text ? `${text}万` : null;
          }
        },
        {
          title: "已投金额",
          dataIndex: "investAmountTotal",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="investAmountTotal" mod={this} />
              <GridRangeFilter filterKey="investAmountTotal" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return text ? `${text}万` : null;
          }
        },
        {
          title: "已退金额",
          dataIndex: "withdrawalAmountTotal",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="withdrawalAmountTotal" mod={this} />
              <GridRangeFilter filterKey="withdrawalAmountTotal" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return text ? `${text}万` : null;
          }
        },
        {
          title: "基金负责人",
          dataIndex: "receiverName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="receiverName" mod={this} />
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
        },
        {
          title: "发行状态",
          dataIndex: "issuedStatuss",
          filters: dic_fund_issued_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="issuedStatuss" mod={this} />
            </div>
          ),
          render(text, record) {
            return record.issuedStatusText;
          }
        },
        {
          title: "操作",
          width: 100,
          fixed: "right",
          render: (text, record) => {
            return record.productId ? (
              <span>
                已导入<a
                  style={{ marginLeft: 5 }}
                  href={`/product/detail/${record.productId}`}
                  target="_blank"
                >
                  查看
                </a>
              </span>
            ) : (
              <a
                onClick={() => {
                  this.importProductModal.show({ id: record.id });
                }}
              >
                导入财富管理
              </a>
            );
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "typeIds");
    this.resetFilterByKey(params, "levels");
    this.resetFilterByKey(params, "riskLevels");
    this.resetFilterByKey(params, "productScale");
    this.resetFilterByKey(params, "investAmountTotal");
    this.resetFilterByKey(params, "withdrawalAmountTotal");
    this.resetFilterByKey(params, "receiverName");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "issuedStatuss");

    if (params.productScale && params.productScale.length) {
      params.productScaleBegin = params.productScale[0];
      params.productScaleEnd = params.productScale[1];
      delete params.productScale;
    }
    if (params.investAmountTotal && params.investAmountTotal.length) {
      params.investAmountTotalBegin = params.investAmountTotal[0];
      params.investAmountTotalEnd = params.investAmountTotal[1];
      delete params.investAmountTotal;
    }
    if (params.withdrawalAmountTotal && params.withdrawalAmountTotal.length) {
      params.withdrawalAmountTotalBegin = params.withdrawalAmountTotal[0];
      params.withdrawalAmountTotalEnd = params.withdrawalAmountTotal[1];
      delete params.withdrawalAmountTotal;
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
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params.sort.replace("end", "");
    }

    params.scope = this.state.menuName.value;

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
  showModal(modal, data) {
    this.refs[modal].show(data);
  }
  handleMenuClick = e => {
    let menuName = {
      text: e.item.props.children,
      value: e.key
    };

    this.setState({ menuName }, () => {
      this.gridManager.grid.reload();
    });
  };
  reload = () => {
    this.gridManager.grid.reload();
  };

  handleFollow = () => {
    const { selectIds } = this.state;
    let ids = selectIds.join(",");

    this.fund.focus(ids).then(res => {
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
      title: "确定删除选中基金?",
      onOk() {
        return _this.fund.delete(ids).then(res => {
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
                title: `您选择的基金中，以下${failList.length}个无法删除`,
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
                      是否继续删除其他选中基金？
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
                title: "您选择的基金无法删除：",
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
    let { menuName, selectRowsCount } = this.state;

    const PermissionButton = Permission(
      <Link to="/assets/fund/new">
        <Button className={"btn_add"} onClick={this.handleEditModal}>
          <img src={icon_add + "@1x.png"} />
          新增基金
        </Button>
      </Link>
    );

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>投资管理</Breadcrumb.Item>
          <Breadcrumb.Item>基金</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/assets/fund/get_page"
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
                      <Menu.Item key="all">全部基金</Menu.Item>
                      <Menu.Item key="imported">导入财富管理的基金</Menu.Item>
                      <Menu.Item key="focus">我关注的基金</Menu.Item>
                    </Menu>
                  }
                >
                  <a className={`ant-dropdown-link ${style.title}`}>
                    {menuName.text}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </div>
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                <PermissionButton auth="assets.fund.add" />
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
        </div>
        <FundFloatPane
          ref={ref => (this.fundFloatPane = ref)}
          reload={this.reload}
        />
        <ImportProductModal
          ref={ref => (this.importProductModal = ref)}
          callback={this.reload}
        />
      </Page>
    );
  }
}
