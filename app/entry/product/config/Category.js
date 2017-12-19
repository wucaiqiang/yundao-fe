/**
 * 类别配置
 */
import React from "react";
import extend from "extend";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import Base from "../../../components/main/Base";
import Page from "../../../components/main/Page";
import Permission from "components/permission";

import {
  Breadcrumb,
  Table,
  Icon,
  Form,
  Input,
  Radio,
  Button,
  message,
  Modal
} from "antd";

const confirm = Modal.confirm;

import style from "./Category.scss";

import GM from "../../../lib/gridManager.js";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridCheckboxFilter,
  GridDateFilter
} = GM;

// currency.load(); 引入的页面组件模块
import EditElementsModal from "../../../services/product/config/editElementsModal";

import ProductCategory from "../../../model/Product/category";

import EditCategory from "./EditCategory";

import utils from "../../../utils/";

const icon_export = "/assets/images/icon/导出@2x.png";
const icon_add = "/assets/images/icon/新增@2x.png";

class ProductConfigCategory extends Base {
  static get NAME() {
    return "ProductConfigCategory";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductConfigCategory.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true
    };
  }

  getFilterData(key) {
    let data;

    data = this.state[key];
    data =
      data &&
      data.map((d, i) => {
        return { text: d.text, value: d.value };
      });
    return data;
  }

  getFloatToolsBarCls() {
    let cls;

    cls = ["vant-float-bar"];
    if (this.state.selectRowsCount) {
      cls.push("open");
    }
    return cls.join(" ");
  }
  getColumns() {
    const columns = [
      {
        title: "类别名称",
        dataIndex: "name",
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="name" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <Link to={`/product/config/category/${record.id}`}>{text}</Link>
          );
        }
      },
      {
        title: "是否启用",
        dataIndex: "isEnabled",
        filters: [
          {
            text: "启用",
            value: "1"
          },
          {
            text: "关闭",
            value: "0"
          }
        ],
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="isEnabled" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.isEnabled ? "启用" : "关闭";
        }
      },
      {
        title: "创建日期",
        dataIndex: "createDate",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridDateFilter filterKey="createDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return utils.formatDate(record.createDate);
        }
      }
    ];

    return columns;
  }
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "isEnabled");

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
    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0].values[0];
      params.createDateEnd = params.createDate[0].values[1];
      delete params.createDate;
    }
    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key] instanceof Array) {
        params[key] = params[key].join(",");
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
    let state;

    state = this.state;
    state.selectIds = selectData.selectIds;
    state.selectRowsCount = selectData.selectRowsCount;
    state.selectRowsData = selectData.selectRowsData;
    this.setState(state);
  }
  showModal(modal, data) {
    this.refs[modal].show(data);
  }

  removeCategory = () => {
    const ids = this.state.selectIds;
    const category = new ProductCategory();
    const _this = this;
    confirm({
      iconType: "exclamation-circle",
      title: "确定将选择的基金产品类别删除？",
      content: "删除成功后，该操作将无法恢复。",
      onOk() {
        category.delete(ids).then(res => {
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

            if (successIds.length > 0) {
              Modal.confirm({
                width: 460,
                title: `您选择的基金产品类别中，以下${
                  failList.length
                }个类别无法删除`,
                content: (
                  <div>
                    <div style={{ paddingTop: 15, paddingBottom: 15 }}>
                      {messageContent}
                    </div>
                    <p
                      style={{
                        fontSize: "14px"
                      }}
                    >
                      是否继续删除其他选中类别？
                    </p>
                  </div>
                ),
                onOk() {
                  return category.delete(successIds).then(res => {
                    if (res.success) {
                      message.success("删除成功");
                      _this.gridManager.grid.reload();
                    }
                  });
                }
              });
            } else {
              //将选中项置空
              _this.gridManager.clearRowSelect();
              // _this.setState({ selectRowsCount: 0, selectIds: [] });

              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的产品类别无法删除",
                content: <div style={{ paddingTop: 15 }}>{messageContent}</div>,
                okText: "确定"
              });
            }
          } else if (res.success) {
            message.success("删除成功");
            _this.gridManager.grid.reload();
          }
        });
      },
      okText: "确定",
      cancelText: "取消"
    });
  };

  showEditCategory = data => {
    this.setState({ showEditCategory: true, currentCategory: data });
  };

  doReloadGrid() {
    this.gridManager.grid.reload();
  }

  render() {
    const { children, ...others } = this.props;
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    const CategoryNewBtn = Permission(
      <Link to="/product/config/category/new">
        <Button className="btn_add">
          <img src={icon_add} alt="" />
          新增类别
        </Button>
      </Link>
    );

    const table = (
      <div className="vant-panel">
        <GridManager
          onSelect={selectData => {
            this.handleSelect(selectData);
          }}
          columns={this.getColumns()}
          url="/product/fieldgroup/get_page"
          beforeLoad={params => {
            return this.beforeLoad(params);
          }}
          gridWrapClassName="grid-panel auto-width-grid"
          mod={this}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          <div className={`vant-filter-bar clearfix`}>
            <div className="fl">
              <FilterBar gridManager={this.gridManager} ref="filterBar" />
            </div>
            <div className="vant-filter-bar-action fr">
              {/* <Button className={'btn_export'}>
                  <img src={icon_export} alt=""/>导出
                </Button> */}
              <CategoryNewBtn auth={"product.fieldgroup.add"} />
            </div>

            <div className={this.getFloatToolsBarCls()}>
              已选中
              <span className="count">{this.state.selectRowsCount}</span>
              项
              <span className="separator">|</span>
              <a className="ant-btn-link" onClick={this.removeCategory}>
                <Icon type="delete" />删除
              </a>
            </div>
          </div>
        </GridManager>
      </div>
    );
    return this.state.showEditCategory ? (
      <EditCategory data={this.state.currentCategory} />
    ) : (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>基金产品配置</Breadcrumb.Item>
            <Breadcrumb.Item>类别配置</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="page-content">{table}</div>
      </Page>
    );
  }
}

function Mod(props) {
  return <ProductConfigCategory {...props} />;
}

export default Mod;
