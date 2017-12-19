import React from "react";
import PropTypes from "prop-types";
import {
    Breadcrumb,
    Button,
    Icon,
    Menu,
    Input,
    Modal,
    Popover,
    Dropdown,
    message
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import extend from "extend";
import Utils from "utils/";
import GM from "lib/gridManager";

import EnumProduct from "enum/enumProduct";

import AuditModal from "services/common/auditModal";
import AuditRecordModal from "services/product/control/auditRecordModal";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";

import Product from "model/Product/";
import ProductCategory from "model/Product/category";
import Dictionary from "model/dictionary";

import style from "./Audit.scss";

const {
    GridManager,
    GridInputFilter,
    FilterBar,
    GridSortFilter,
    GridDateFilter,
    GridCheckboxFilter
} = GM;

const { EnumProductStatus } = EnumProduct;

export default class ProductControlAudit extends Base {
    static get NAME() {
        return "ProductControlAudit";
    }
    
    static get contextTypes() {
        return { data: PropTypes.object };
    }
    
    constructor(props, context) {
        super(props, context);
        if (context.data[ProductControlAudit.NAME]) {
            this.context = context;
        }
        this.state = {
        loading: true,
        filters: {},
        menuName: {
        text: "未处理的申请",
        value: "unprocess"
        },
        productCategory: []
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
    getDictionary() {
        this.dictionary.gets("dic_product_examine_status").then(res => {
                                                                if (res.success && res.result) {
                                                                let filters = {};
                                                                res.result.map(item => {
                                                                               filters[item.value] = item.selections;
                                                                               });
                                                                
                                                                console.log("filters", filters);
                                                                
                                                                this.setState({ filters });
                                                                }
                                                                });
    }
    getText(record) {
        if (record.receiver && record.assistant) {
            return `${record.receiver}/${record.assistant}`;
        } else if (!record.receiver && record.assistant) {
            return `--/${record.assistant}`;
        } else if (record.receiver && !record.assistant) {
            return `${record.receiver}/--`;
        } else {
            return null;
        }
    }
    getColumns = () => {
        const { filters, productCategory } = this.state;
        
        const PermissionButton = record => {
            return Permission(
                              <span>
                              <a
                              onClick={() =>
                              this.handlePassModal({
                                                   id: record.id,
                                                   action: 1
                                                   })
                              }
                              >
                              通过
                              </a>
                              <a
                              onClick={() => {
                              this.handleAuditModal("auditRejectModal", {
                                                    id: record.id,
                                                    action: 2
                                                    });
                              }}
                              >
                              驳回
                              </a>
                              </span>,
                              <span>
                              <Popover
                              placement="topRight"
                              content={"无权限操作"}
                              arrowPointAtCenter
                              >
                              <span className="disabled">通过</span>
                              </Popover>
                              <Popover
                              placement="topRight"
                              content={"无权限操作"}
                              arrowPointAtCenter
                              >
                              <span className="disabled">驳回</span>
                              </Popover>
                              </span>
                              );
        };
        
        const columns = [
                         {
                         title: "产品名称",
                         dataIndex: "productName",
                         width: 200,
                         fixed: "left",
                         filterDropdown: (
                                          <div className={"filter_dropdown"}>
                                          <GridInputFilter filterKey="productName" mod={this} />
                                          </div>
                                          ),
                         render: (text, record) => {
                         return (
                                 <a
                                 role="customerName"
                                 onClick={() => this.handleFloatPanel(record)}
                                 title={record.productName}
                                 >
                                 {record.productName}
                                 </a>
                                 );
                         }
                         },
                         {
                         title: "产品类别",
                         dataIndex: "productTypeIds",
                         filters: productCategory,
                         filterDropdown: (
                                          <div className={"filter_dropdown"}>
                                          <GridCheckboxFilter filterKey="productTypeIds" mod={this} />
                                          </div>
                                          ),
                         render: (text, record) => {
                         return record.productTypeText;
                         }
                         },
                         {
                         title: "负责人/助理",
                         dataIndex: "receiver",
                         width: 200,
                         className: "ant-table-col",
                         filterDropdown: (
                                          <div className={"filter_dropdown"}>
                                          <GridInputFilter filterKey="receiver" mod={this} />
                                          </div>
                                          ),
                         render: (text, record) => {
                         return this.getText(record);
                         }
                         },
                         {
                         title: "申请人",
                         dataIndex: "proposer",
                         filterDropdown: (
                                          <div className={"filter_dropdown"}>
                                          <GridInputFilter filterKey="proposer" mod={this} />
                                          </div>
                                          )
                         },
                         {
                         title: "申请事项",
                         render: (text, record) => {
                         return "申请发布";
                         }
                         },
                         {
                         title: "操作时间",
                         dataIndex: "approveDate",
                         width: 140,
                         sorter: true,
                         filterDropdown: (
                                          <div className={"filter_dropdown"}>
                                          <GridSortFilter filterKey="approveDate" mod={this} />
                                          <GridDateFilter filterKey="approveDate" mod={this} />
                                          </div>
                                          ),
                         render: (text, record) => {
                         return Utils.formatDate(text);
                         }
                         },
                         {
                         title: "审批结果",
                         dataIndex: "statuss",
                         width: 140,
                         filters: filters.dic_product_examine_status,
                         filterDropdown: (
                                          <div className={"filter_dropdown"}>
                                          <GridCheckboxFilter filterKey="statuss" mod={this} />
                                          </div>
                                          ),
                         render: (text, record) => {
                         let content = null;
                         if (record.status === EnumProductStatus.enum.REVIEW) {
                         content = <span className="status">{record.statusText}</span>;
                         } else if (record.status === EnumProductStatus.enum.PASS) {
                         content = <span className="status green">{record.statusText}</span>;
                         } else if (record.status === EnumProductStatus.enum.REJECT) {
                         content = <span className="status red">{record.statusText}</span>;
                         } else {
                         content = <span className="status">{record.statusText}</span>;
                         }
                         return <div className="operation">{content}</div>;
                         }
                         },
                         {
                         title: "操作",
                         width: 150,
                         fixed: "right",
                         render: (text, record) => {
                         let content = null;
                         
                         if (record.status === EnumProductStatus.enum.REVIEW) {
                         const ProductPermissionButton = PermissionButton(record);
                         
                         content = record.isCanAudit ? (
                                                        <ProductPermissionButton auth="product.examine.audit" />
                                                        ) : null;
                         }
                         return (
                                 <div className="operation">
                                 {content}
                                 <a
                                 onClick={() => {
                                 this.auditRecordModal.show(record);
                                 }}
                                 >
                                 审批记录
                                 </a>
                                 </div>
                                 );
                         }
                         }
                         ];
        
        return columns;
    };
    beforeLoad(params) {
        this.gridManager.makeFilterMapData();
        this.resetFilterByKey(params, "productName");
        this.resetFilterByKey(params, "productTypeIds");
        this.resetFilterByKey(params, "receiver");
        this.resetFilterByKey(params, "issuedStatusIds");
        this.resetFilterByKey(params, "proposer");
        this.resetFilterByKey(params, "createDate");
        this.resetFilterByKey(params, "approveDate");
        this.resetFilterByKey(params, "statuss");
        
        params.scope = this.state.menuName.value;
        params.assistant = params.receiver;
        
        if (params.createDate && params.createDate.length) {
            params.createDateBegin = params.createDate[0];
            params.createDateEnd = params.createDate[1];
            delete params.createDate;
        }
        if (params.approveDate && params.approveDate.length) {
            params.approveDateBegin = params.approveDate[0];
            params.approveDateEnd = params.approveDate[1];
            delete params.approve;
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
                    params[key][0].filterType === "dateRange"
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
    handleMenuClick = e => {
        let menuName = {
        text: e.item.props.children,
        value: e.key
        };
        
        this.setState({ menuName }, () => {
                      this.gridManager.grid.reload();
                      });
    };
    handleFlow = data => {
        const _this = this;
        this.product.audit(data).then(res => {
                                      if (res.success) {
                                      message.success("操作成功");
                                      _this.auditModal.hide();
                                      _this.gridManager.grid.reload();
                                      }
                                      });
    };
    /**
     * 驳回/取消弹窗回调
     *
     */
    handleAuditCallback = (data, origin) => {
        const _this = this;
        
        let postData = this.auditData;
        postData.reason = data.reason;
        
        this.product.audit(postData).then(res => {
                                          if (res && res.success) {
                                          message.success("操作成功");
                                          
                                          origin.hide();
                                          
                                          _this.gridManager.grid.reload();
                                          }else{
                                          // this.auditRecordModal.setState({
                                          //   confirmLoading:false
                                          // })
                                          // this.auditCancelModal.setState({
                                          //   confirmLoading:false
                                          // })
                                          }
                                          });
    };
    handleAuditModal = (modal, data) => {
        this.auditData = data;
        this[modal].show();
    };
    handlePassModal = data => {
        const _this = this;
        Modal.confirm({
                      title: "请确定产品信息无误后通过上线审批",
                      onOk() {
                      return _this.product.audit(data).then(res => {
                                                            if (res.success) {
                                                            message.success("操作成功");
                                                            
                                                            _this.gridManager.grid.reload();
                                                            }
                                                            });
                      }
                      });
    };
    handleFloatPanel = data => {
        data.id = data.productId;
        data.open_source = "product_audit";
        this.productDetailFloat.show(data);
    };
    render() {
        const { menuName } = this.state;
        
        return (
                <Page {...this.props}>
                <Breadcrumb className="page-breadcrumb">
                <Breadcrumb.Item>产品管理</Breadcrumb.Item>
                <Breadcrumb.Item>产品审批</Breadcrumb.Item>
                </Breadcrumb>
                <div className="page-content">
                <GridManager
                noRowSelection={true}
                columns={this.getColumns()}
                url="/product/control/audit/get_page"
                beforeLoad={params => {
                return this.beforeLoad(params);
                }}
                gridWrapClassName="grid-panel auto-width-grid"
                mod={this}
                scroll={{ x: "150%" }}
                ref={gridManager => (this.gridManager = gridManager)}
                >
                <div className={`vant-filter-bar clearfix`}>
                <div className="vant-filter-bar-title fl">
                <Dropdown
                overlay={
                <Menu onClick={this.handleMenuClick}>
                <Menu.Item key="unprocess">未处理的申请</Menu.Item>
                <Menu.Item key="all">全部申请</Menu.Item>
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
                </div>
                </GridManager>
                <AuditModal
                ref={ref => (this.auditModal = ref)}
                callback={this.handleAuditReject}
                />
                <AuditModal
                title="驳回申请"
                ref={ref => (this.auditRejectModal = ref)}
                callback={this.handleAuditCallback}
                />
                <AuditModal
                title="取消申请"
                labelName="取消原因"
                ref={ref => (this.auditCancelModal = ref)}
                callback={this.handleAuditCallback}
                />
                <AuditRecordModal ref={ref => (this.auditRecordModal = ref)} />
                </div>
                <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
                </Page>
                );
    }
}
