import React from "react";
import extend from "extend";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Table,
  Icon,
  Form,
  Input,
  Button,
  Modal,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import style from "./Elements.scss";

import GM from "lib/gridManager.js";

const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const GridCheckboxFilter = GM.GridCheckboxFilter;
const GridSortFilter = GM.GridSortFilter;
const FilterBar = GM.FilterBar;

const confirm = Modal.confirm;

import EditElementsModal from "services/product/config/editElementsModal";

import Elements from "model/Product/elements";

const icon_export = "/assets/images/icon/导出@2x.png";
const icon_add = "/assets/images/icon/新增@2x.png";

export default class ProductConfigElement extends Base {
  static get NAME() {
    return "ProductConfigElement";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductConfigElement.NAME]) {
      this.context = context;
    }
    this.state = {
      selectRowsData: [],
      selectIds: [],
      selectRowsCount: 0
    };
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
        title: "要素名称",
        dataIndex: "name",
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="name" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return (
            <a
              href="javascript:;"
              className="chance-name"
              role="customerName"
              onClick={() => this.showModal("editElementsModal", record)}
            >
              {text || "--"}
            </a>
          );
        }
      },
      {
        title: "类型",
        dataIndex: "type",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter filterKey="type" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.typeText;
        }
      },
      {
        title: "是否必填",
        dataIndex: "isMandatory",
        filters: [
          {
            text: "必填",
            value: "1"
          },
          {
            text: "可空",
            value: "0"
          }
        ],
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="isMandatory" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.isMandatoryText;
        }
      },
      {
        title: "是否通用",
        dataIndex: "isShare",
        filters: [
          {
            text: "通用",
            value: "1"
          },
          {
            text: "非通用",
            value: "0"
          }
        ],
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="isShare" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return record.isShareText;
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
          return record.isEnabledText;
        }
      }
    ];

    return columns;
  }
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "type", "typeText");
    this.resetFilterByKey(params, "isMandatory");
    this.resetFilterByKey(params, "isShare");
    this.resetFilterByKey(params, "isEnabled");
    this.resetFilterByKey(params, "access");

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
  removeElements = () => {
    const ids = this.state.selectIds;
    const elements = new Elements();
    const _this = this;
    confirm({
      iconType: "exclamation-circle",
      title: "确定将选择的基金产品要素删除？",
      content: "删除成功后，该操作将无法恢复。",
      onOk() {
        elements.delete(ids).then(res => {
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
                title: `您选择的基金产品要素中，以下${
                  failList.length
                }个要素无法删除：`,
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
                      是否继续删除其他选中要素？
                    </p>
                  </div>
                ),
                onOk() {
                  //有可删除的才两次删除
                  return elements.delete(successIds).then(res => {
                    if (res.success) {
                      message.success("删除成功");
                      _this.gridManager.grid.reload();
                    }
                  });
                }
              });
            } else {
              _this.gridManager.clearRowSelect();
              // _this.setState({ selectRowsCount: 0, selectIds: [] });

              //错误同一个原因时
              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的基金产品要素无法删除：",
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
  editElementsModalSubmit = values => {
    this.doReloadGrid();
  };
  doReloadGrid() {
    this.gridManager.grid.reload();
  }
  render() {
    const { children, ...others } = this.props;
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    const ElementsAddBtn = Permission(
      <Button
        className={"btn_add"}
        onClick={() => this.showModal("editElementsModal")}
      >
        <img src={icon_add} alt="" />
        新增要素
      </Button>
    );

    const table = (
      <div className="vant-panel">
        <GridManager
          onSelect={selectData => {
            this.handleSelect(selectData);
          }}
          columns={this.getColumns()}
          url="/product/element/get_page"
          beforeLoad={params => {
            return this.beforeLoad(params);
          }}
          gridWrapClassName="grid-panel auto-width-grid"
          mod={this}
          scroll={{
            x: "105%"
          }}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          <div className={`vant-filter-bar clearfix`}>
            <div className="fl">
              <FilterBar gridManager={this.gridManager} ref="filterBar" />
            </div>
            <div className="vant-filter-bar-action fr">
              {/* <Button className={'btn_export'}><img src={icon_export} alt=""/>导出</Button> */}
              <ElementsAddBtn auth={"product.element.add"} />
            </div>

            <div className={this.getFloatToolsBarCls()}>
              已选中
              <span className="count">{this.state.selectRowsCount}</span>
              项
              <span className="separator">|</span>
              <a className="ant-btn-link" onClick={this.removeElements}>
                <Icon type="delete" />删除
              </a>
            </div>
          </div>
        </GridManager>
      </div>
    );
    return (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>基金产品配置</Breadcrumb.Item>
            <Breadcrumb.Item>要素配置</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="page-content">{table}</div>
        <EditElementsModal
          submit={this.editElementsModalSubmit}
          ref="editElementsModal"
        />
      </Page>
    );
  }
}
