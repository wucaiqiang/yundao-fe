import React from "react";
import ReactDom from "react-dom";
import extend from "extend";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

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

import AuditModal from "services/common/auditModal";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";

import Product from "model/Product/";
import ProductCategory from "model/Product/category";
import Dictionary from "model/dictionary";

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

const { Option } = Select;

const { EnumProductStatus, EnumProductIssuedStatus } = EnumProduct;

const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";
const icon_question = "/assets/images/icon/问号";

class ProductStartRasingTip extends Base {
  state = { declaractionModel: 2 };
  render = () => {
    const { title } = this.props;
    return (
      <div>
        <p>{title}</p>
        <div style={{ marginTop: 15 }}>
          <p style={{ marginBottom: 15 }}>募集形式:</p>
          <RadioGroup
            onChange={e => {
              const { value } = e.target;
              console.log("value", value);
              this.setState({ declaractionModel: value });
              this.props.callback && this.props.callback(value);
            }}
            value={this.state.declaractionModel}
          >
            <Radio value={2} className="radio-label">
              先预约后报单
            </Radio>
            <Radio value={1} className="radio-label">
              直接报单
            </Radio>
          </RadioGroup>
        </div>
      </div>
    );
  };
}

export default class ProductControlIndex extends Base {
  static get NAME() {
    return "ProductControlIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductControlIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      menuName: { text: "我对接/助理的产品", value: "3" },
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
    this.productCategory = new ProductCategory();
    this.dictionary = new Dictionary();

    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
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
    this.dictionary
      .gets(
        "product_level,product_risk_level,dic_product_issued_status,dic_product_examine_status"
      )
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res.result.map(item => {
            filters[item.value] = item.selections;
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
  getColumns() {
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
              href="javascript:;"
              role="customerName"
              onClick={() => this.showModal("ProductDetailFloat", record)}
            >
              {text}
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
        title: "创建日期",
        dataIndex: "createDate",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="createDate" mod={this} />
            <GridDateFilter filterKey="createDate" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(text);
        }
      },
      {
        title: "上线日期",
        dataIndex: "onLineTime",
        width: 140,
        sorter: true,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridSortFilter filterKey="onLineTime" mod={this} />
            <GridDateFilter filterKey="onLineTime" mod={this} />
          </div>
        ),
        render: (text, record) => {
          return Utils.formatDate(record.onLineTime);
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
          let popover = text => (
            <Popover placement="topLeft" content={text} arrowPointAtCenter>
              <img
                src={icon_question + "@1x.png"}
                srcSet={icon_question + "@2x.png 2x"}
              />
            </Popover>
          );

          let content = null;
          let issuedStatusText = record.issuedStatusText;
          let declarationModelText =
            record.declarationModel === 1 ? "(直接报单)" : "(先预约)";

          if (record.issuedStatus === EnumProductIssuedStatus.enum.RAISING) {
            issuedStatusText += declarationModelText;
          }

          if (record.examineStatus === EnumProductStatus.enum.REVIEW) {
            content = (
              <div>
                <span>{issuedStatusText}</span>
                {popover(`申请上线待审批，申请人：${record.applyUserName}`)}
              </div>
            );
          } else if (record.examineStatus === EnumProductStatus.enum.REJECT) {
            content = (
              <div>
                <span className="red">{issuedStatusText}</span>
                {popover(
                  `申请上线被驳回，申请人：${record.applyUserName}，原因：${record.actionDto
                    .reason}`
                )}
              </div>
            );
          } else if (record.examineStatus === EnumProductStatus.enum.UNDO) {
            content = (
              <div>
                <span>{issuedStatusText}</span>
                {popover(
                  `申请上线已取消，申请人：${record.applyUserName}，原因：${record.actionDto
                    .reason}`
                )}
              </div>
            );
          } else {
            content = issuedStatusText;
          }
          return content;
        }
      },
      {
        title: "操作",
        dataIndex: "operation",
        width: 200,
        fixed: "right",
        render: (text, record) => {
          const options = [];
          if (
            record.actionDto.selectDtos &&
            record.actionDto.selectDtos.length > 0
          ) {
            record.actionDto.selectDtos.map(option => {
              options.push(
                option.canAction ? (
                  <a
                    key={option.value}
                    onClick={() => {
                      option.value === 2
                        ? this.handleCancelModal(record)
                        : this.handleChangeStatus(record.id, option.value);
                    }}
                  >
                    {option.lable}
                  </a>
                ) : (
                  <Popover
                    placement="topLeft"
                    content={option.title}
                    arrowPointAtCenter
                  >
                    <span className="disabled">{option.lable}</span>
                  </Popover>
                )
              );
            });
          }
          return <div className="operation">{options}</div>;
        }
      }
    ];

    return columns;
  }
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "typeIds");
    this.resetFilterByKey(params, "issuedStatuss");
    this.resetFilterByKey(params, "examineStatuss");
    this.resetFilterByKey(params, "typeIds");
    this.resetFilterByKey(params, "levels");
    this.resetFilterByKey(params, "riskLevels");
    this.resetFilterByKey(params, "productScale");
    this.resetFilterByKey(params, "assistantOrReceiverRealName");
    this.resetFilterByKey(params, "createDate");
    this.resetFilterByKey(params, "onLineTime");

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }

    params.productRange = this.state.menuName.value;
    params.assistant = params.receiver;

    if (params.productScale && params.productScale.length) {
      params.productScaleBegin = params.productScale[0];
      params.productScaleEnd = params.productScale[1];
      delete params.productScale;
    }

    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }
    if (params.onLineTime && params.onLineTime.length) {
      params.onLineTimeBegin = params.onLineTime[0];
      params.onLineTimeEnd = params.onLineTime[1];
      delete params.onLineTime;
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
          ["numberRange", "dateRange"].indexOf(params[key][0].filterType) > -1
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
    let { selectIds, selectRowsCount = 0, selectRowsData } = selectData;
    this.setState({ selectIds, selectRowsCount, selectRowsData });
  }

  handleChangeStatus = (id, productManagerAction) => {
    const tipsConfig = {
      1: {
        title: "确定申请产品上线？",
        content: "申请上线后，请留意审批结果，及时进行后续操作"
      },
      2: {
        title: "确定取消上线申请？",
        content: "取消后，产品将变为未上线状态"
      },
      3: {
        title: "确定终止产品发行？",
        content: "终止发行后，产品将不可进行预约和报单"
      },
      4: {
        title: "确定重新申请上线？",
        content: "申请上线后，请留意审批结果，及时进行后续操作"
      },
      5: {
        title: "确定启动产品预售？",
        content: "启动预售后，产品可以开始接受预约"
      },
      6: {
        title: "确定启动产品募集？",
        content: (
          <ProductStartRasingTip
            title="启动募集后，产品正式进入募集中状态，可接受预约、报单"
            callback={value => {
              this.setState({
                declaractionModel: value
              });
            }}
          />
        )
      },
      7: {
        title: "确定启动产品募集？",
        content: (
          <ProductStartRasingTip
            title="启动募集后，产品正式进入募集中状态，可接受预约、报单"
            callback={value => {
              this.setState({
                declaractionModel: value
              });
            }}
          />
        )
      },
      8: {
        title: "确定暂停预售？",
        content: "暂停预售后，产品将返回到上线准备中状态，暂不接受预约和报单"
      },
      9: {
        title: "确定结束募集？",
        content: "结束募集后，产品将进入募集结束状态，等待产品成立后可设定为封闭中状态"
      },
      10: {
        title: "确定重新开放申购？",
        content: (
          <ProductStartRasingTip
            title="重新开放申购后，产品重新进入募集中状态，可继续接受预约或报单"
            callback={value => {
              this.setState({
                declaractionModel: value
              });
            }}
          />
        )
      },
      11: {
        title: "确定设为存续／封闭中？",
        content: "产品成立进入存续期，可设为存续／封闭中状态"
      },
      12: {
        title: "确定设为清算退出？",
        content: "设定为清算退出后产品将不可重新开放申购"
      },
      13: {
        title: "确定暂停募集？",
        content: "暂停募集后，产品将返回到上线准备中状态，暂不接受预约和报单"
      }
    };

    const { title, content } = tipsConfig[productManagerAction] || {};

    Modal.confirm({
      width: 350,
      title: title || null,
      content: content || null,
      onOk: () => {
        const data = { id, productManagerAction };
        if ([6, 7, 10].indexOf(productManagerAction) > -1) {
          const { declaractionModel } = this.state;
          if (declaractionModel) {
            data.declaractionModel = declaractionModel;
          }
        }
        this.product.update_status(data).then(res => {
          if (res.success) {
            message.success("操作成功");
            this.gridManager.grid.load();
          }
        });
      }
    });
  };
  handleMenuClick = e => {
    let menuName = { text: e.item.props.children, value: e.key };

    this.setState({ menuName }, () => {
      // this.gridManager.grid.load();
      this.gridManager.grid.reload();
    });
  };
  handleDelete = () => {
    let { selectIds } = this.state,
      _this = this,
      ids = selectIds.join(",");

    Modal.confirm({
      width: 350,
      title: "删除后不可撤回，确定吗?",
      onOk() {
        return _this.product.del({ ids }).then(res => {
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
                title: `您选择的产品中，以下${failList.length}个无法删除：`,
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
                      是否继续删除其他选中产品`？
                    </p>
                  </div>
                ),
                onOk() {
                  return _this.product
                    .del({ ids: successIds.join(",") })
                    .then(res => {
                      if (res.success) {
                        message.success("删除成功");
                        _this.gridManager.grid.reload();
                      }
                    });
                }
              });
            } else {
              _this.gridManager.clearRowSelect()
              // _this.setState({ selectRowsCount: 0, selectIds: [] });

              //错误同一个原因时
              if (messageContent.length === 1) {
                messageContent = <p>{failList[0].message}</p>;
              }

              Modal.info({
                title: "您选择的产品无法删除：",
                content: <div style={{ paddingTop: 15 }}>{messageContent}</div>,
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
  showModal(modal, data) {
    this.refs[modal].show(data);
  }

  /**
   * 取消申请弹窗回调
   *
   */
  handleCancel = (data,auditModal) => {
    data.id = this.cancelId;
    data.productManagerAction = 2; //2表示取消申请

    this.product.update_status(data).then(res => {
      auditModal.commit(false)
      if (res.success) {
        message.success("操作成功");
        auditModal.hide();
        this.gridManager.grid.reload();
      }
    });
  };
  handleCancelModal = data => {
    this.cancelId = data.id;
    this.auditModal.show();
  };
  render() {
    let { menuName } = this.state;

    const ProductNewBtn = Permission(
      <Link to="/product/control/new">
        <Button className="btn_add">
          <img
            src={icon_add + "@1x.png"}
            srcSet={icon_add + "@2x.png 2x"}
            alt=""
          />
          新增产品
        </Button>
      </Link>
    );
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>产品管理</Breadcrumb.Item>
          <Breadcrumb.Item>产品管理</Breadcrumb.Item>
        </Breadcrumb>
        <Layout.Content>
          <div className="page-content">
            <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              url="/product/get_manager_List"
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
              }}
            >
              <div className={`vant-filter-bar clearfix`}>
                <div className="vant-filter-bar-title fl">
                  <Dropdown
                    overlay={
                      <Menu onClick={this.handleMenuClick}>
                        <Menu.Item key="0">全部产品</Menu.Item>
                        <Menu.Item key="3">我对接/助理的产品</Menu.Item>
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
                  <ProductNewBtn auth={"product.control.new"} />
                </div>
                <div className={this.getFloatToolsBarCls()}>
                  已选中
                  <span className="count">{this.state.selectRowsCount}</span>
                  项
                  <span className="separator">|</span>
                  <a className="ant-btn-link" onClick={this.handleDelete}>
                    <Icon type="delete" />删除
                  </a>
                </div>
              </div>
            </GridManager>
          </div>
        </Layout.Content>
        <AuditModal
          title="取消申请"
          labelName="取消原因"
          ref={ref => (this.auditModal = ref)}
          callback={this.handleCancel}
        />
        <ProductDetailFloat ref="ProductDetailFloat" />
      </Page>
    );
  }
}
