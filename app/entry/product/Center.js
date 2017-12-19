import React from "react";
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Tooltip,
  message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";
import extend from "extend";

import EnumProduct from "enum/enumProduct";

import EditAppointmentModal from "services/sale/appointment/editAppointmentModal";
import AddDeclarationModal from "services/product/center/addDeclarationModal";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import DeclarationDetailFloat from "services/sale/declaration/detail/declarationDetailFloat";

import Product from "model/Product/";
import ProductCategory from "model/Product/category";
import Dictionary from "model/dictionary";

import style from "./Center.scss";

const { Option } = Select;

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridRangeFilter,
  GridCheckboxFilter
} = GM;

const icon_appointment = "/assets/images/icon/预约";
const icon_declaration = "/assets/images/icon/报单";

const { EnumProductIssuedStatus } = EnumProduct;

export default class ProductCenter extends Base {
  static get NAME() {
    return "ProductCenter";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductCenter.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: { text: "预售和募集中的产品", value: "1" },
      productCategory: [],
      filters: {
        product_level: [],
        product_risk_level: [],
        dic_product_issued_status: []
      }
    };
  }
  componentWillMount() {
    this.product = new Product();
    this.productCategory = new ProductCategory();
    this.dictionary = new Dictionary();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    setTimeout(()=>{
      this.getDictionary();
      this.getProductCategory();
    },800)
  }
  getDictionary() {
    this.dictionary
      .gets("product_level,product_risk_level,dic_product_issued_status")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res.result.map(item => {
            let selections = item.selections;

            //发行状态过滤掉未上线、上线准备中
            if (item.value === "dic_product_issued_status") {
              selections = selections.filter(dic => {
                let value = +dic.value;
                return (
                  value !== EnumProductIssuedStatus.enum.NOONLINE &&
                  value !== EnumProductIssuedStatus.enum.ONLINE
                );
              });
            }
            filters[item.value] = selections;
          });

          this.setState({ filters });
        }
      });
  }
  /**
   * 获取所有产品类型
   *
   * @memberof ProductNoticeIndex
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
  getText(record) {
    if (record.receiverRealName && record.assistantRealName) {
      return `${record.receiverRealName}/${record.assistantRealName}`;
    } else if (!record.receiverRealName && record.assistantRealName) {
      return `--/${record.assistantRealName}`;
    } else if (record.receiverRealName && !record.assistantRealName) {
      return `${record.receiverRealName}/--`;
    } else {
      return null;
    }
  }
  getColumns = () => {
    const PermissionButton = record => {
      return Permission(
        <span>
          {record.canReservation ? (
            <a onClick={() => this.handleAppointment(record)}>预约</a>
          ) : (
            <Popover content={record.notCanReservationTitle}>
              <span className={"status disabled"}>预约</span>
            </Popover>
          )}
        </span>,
        <Popover content="无权限操作">
          <span className={"status disabled"}>预约</span>
        </Popover>
      );
    };
    const PermissionButton1 = record => {
      return Permission(
        <span>
          {record.canDeclaration ? (
            <a onClick={() => this.handleDeclaration(record)}>报单</a>
          ) : (
            <Popover content={record.notCanDeclarationTitle}>
              <span className={"status disabled"}>报单</span>
            </Popover>
          )}
        </span>,
        <Popover content="无权限操作">
          <span className={"status disabled"}>报单</span>
        </Popover>
      );
    };

    let { filters, productCategory } = this.state;
    const columns = [
      {
        title: "产品名称",
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
              onClick={() => {
                this.showModal("ProductDetailFloat", record);
              }}
            >
              {text || "--"}
            </a>
          );
        }
      },
      {
        title: "产品类别",
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
        title: "重要等级",
        dataIndex: "levels",
        sorter: true,
        filters: filters.product_level,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="levels" mod={this} />
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
        sorter: true,
        filters: filters.product_risk_level,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="riskLevels" mod={this} />
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
          return record.productScale
            ? `${record.productScale}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                "万"
            : null;
        }
      },
      {
        title: "发行状态",
        dataIndex: "issuedStatuss",
        filters: filters.dic_product_issued_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter filterKey="issuedStatuss" mod={this} />
          </div>
        ),
        render: (text, record) => {
          let issuedStatusText = record.issuedStatusText;
          let declarationModelText =
            record.declarationModel === 1 ? "(直接报单)" : "(先预约)";

          if (record.issuedStatus === EnumProductIssuedStatus.enum.RAISING) {
            issuedStatusText += declarationModelText;
          }

          return issuedStatusText;
        }
      },
      {
        title: "募集进度",
        render: (text, record) => {
          let reservation = record.reservationAmount || 0,
            declaration = record.declarationAmount || 0,
            content = `预约${reservation}万/报单${declaration}万`;
          return (
            <Popover placement="top" content={content}>
              <span>
                {reservation}万/{declaration}万
              </span>
            </Popover>
          );
        }
      },
      {
        title: "负责人/助理",
        dataIndex: "assistantOrReceiverRealName",
        width: 200,
        className: "ant-table-col",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="assistantOrReceiverRealName"
              mod={this}
            />
          </div>
        ),
        render: (text, record) => {
          return this.getText(record);
        }
      },
      {
        title: "上线日期",
        dataIndex: "onLineTime",
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="onLineTime" mod={this} />
            <GridDateFilter filterKey="onLineTime" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "操作",
        width: 100,
        fixed: "right",
        render: (text, record) => {
          record.from = "product.center";

          const AppointBtn = PermissionButton(record);
          const DeclarationBtn = PermissionButton1(record);

          return (
            <div className="operation">
              <AppointBtn auth="product.center.reservation" />
              <DeclarationBtn auth="product.center.declaration" />
            </div>
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
    this.resetFilterByKey(params, "issuedStatuss");
    this.resetFilterByKey(params, "typeIds");
    this.resetFilterByKey(params, "levels");
    this.resetFilterByKey(params, "riskLevels");
    this.resetFilterByKey(params, "productScale");
    this.resetFilterByKey(params, "assistantOrReceiverRealName");
    this.resetFilterByKey(params, "onLineTime");

    params.productRange = this.state.menuName.value;

    if (params.productScale && params.productScale.length) {
      params.productScaleStart = params.productScale[0];
      params.productScaleEnd = params.productScale[1];
      delete params.productScale;
    }

    if (params.onLineTime && params.onLineTime.length) {
      params.onLineTimeStart = params.onLineTime[0];
      params.onLineTimeEnd = params.onLineTime[1];
      delete params.onLineTime;
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
  reloadGrid = () => {
    this.gridManager.grid.reload();
  };
  showModal(modal, data) {
    this.refs[modal].show(data);
  }
  showFloat(float,data){
    this[float].show(data)
  }
  handleSelect(selectData) {
    let state = this.state;

    state.selectIds = selectData.selectIds;
    state.selectRowsCount = selectData.selectRowsCount;
    state.selectRowsData = selectData.selectRowsData;

    this.setState(state);
  }
  /**
   * 关注
   *
   * @returns
   * @memberof CustomerMy
   */
  handleFollow = () => {
    let { selectIds: customerIds } = this.state,
      _this = this;
    this.product.focus(customerIds).then(res => {
      if (res.success) {
        Modal.success({
          title: "关注产品成功",
          content: "可在左上角筛选项中选择查看全部关注的产品。",
          okText: "确定"
        });

        _this.gridManager.clearRowSelect();
      }
    });
  };
  handleMenuClick = e => {
    let menuName = { text: e.item.props.children, value: e.key };

    this.setState({ menuName }, () => {
      this.gridManager.grid.reload();
    });
  };
  handleAppointment = data => {
    if (
      [
        EnumProductIssuedStatus.enum.PRESALE,
        EnumProductIssuedStatus.enum.RAISING
      ].indexOf(data.issuedStatus) > -1
    ) {
      this.editAppointmentModal.show(
        { productId: data.id, productName: data.name },
        false
      );
    } else {
      Modal.info({
        width: 350,
        title: "该产品募集结束，无法预约",
        okText: "确定"
      });
    }
  };
  handleDeclaration = data => {
    if (
      ([
        EnumProductIssuedStatus.enum.PRESALE,
        EnumProductIssuedStatus.enum.RAISING
      ].indexOf(data.issuedStatus) > -1 &&
        data.existPassReservation) ||
      data.declarationModel == 1
    ) {
      data.productId = data.id;
      this.addDeclarationModal.show(data);
    } else {
      Modal.info({
        width: 350,
        title: "该产品没有确认的预约，无法报单",
        content: "请先预约，并等待预约额度确认后再报单",
        okText: "确定"
      });
    }
  };
  render() {
    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>产品中心</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/product/center/gets"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "150%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="1">预售和募集中的产品</Menu.Item>
                      <Menu.Item key="2">我关注的产品</Menu.Item>
                      <Menu.Item key="0">全部产品</Menu.Item>
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
              </div>
            </div>
          </GridManager>
          
          <EditAppointmentModal
            initFields="productId"
            reload={this.reloadGrid}
            ref={ref => (this.editAppointmentModal = ref)}
          />
          <AddDeclarationModal
            reload={this.reloadGrid}
            parent={this}
            ref={ref => (this.addDeclarationModal = ref)}
            history={this.props.history}
          />
        </div>
        <ProductDetailFloat ref="ProductDetailFloat" />
        <DeclarationDetailFloat
          ref={ref => (this.declarationDetailFloat = ref)}
            reload={this.reloadGrid}
            history={this.props.history}
          />
      </Page>
    );
  }
}
