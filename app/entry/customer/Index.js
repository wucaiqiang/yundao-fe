import React from "react";
import PropTypes from "prop-types";
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

import ClassNames from "classnames";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";
import Customer from "model/Customer";

import ImportCustomerModal from "services/customer/import/importCustomerModal";
import CustomerDetailFloat from "services/customer/detail/customerDetailFloat";
import CustomerFollowModal from "services/customer/my/customerFollowModal";
import CustomerBackModal from "services/customer/my/customerBackModal";
import EditCustomerModal from "services/customer/editCustomerModal";
import CustomerDeployModal from "services/customer/pool/customerDeployModal";
import CustomerRecoverModal from "services/customer/pool/customerRecoverModal";
import CustomerAllotModal from "services/customer/pool/customerAllotModal";
import FilterCustomerForm from "services/customer/filterCustomerForm";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridCitysFilter
} = GM;

const icon_operation = "/assets/images/icon/操作";
const icon_deploy = "/assets/images/customer/调配";
const icon_reconver = "/assets/images/customer/分配回访";
const icon_allot = "/assets/images/customer/回收";

export default class CustomerIndex extends Base {
  static get NAME() {
    return "CustomerIndex";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[CustomerIndex.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "我负责的客户",
        value: "my"
      },
      filters: {
        dic_sex: [],
        dic_customer_level: [],
        dic_yes_or_no: [],
        dic_customer_status: [],
        dic_customer_buy_type: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.customer = new Customer();

    this.getDictionary();
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }

  getDictionary() {
    this.dictionary
      .gets(
        "dic_sex,dic_customer_level,dic_yes_or_no,dic_customer_status,dic_customer_buy_type"
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
  getAreaText(record) {
    if (record.provinceText && record.cityText) {
      return `${record.provinceText}/${record.cityText}`;
    } else if (!record.provinceText) {
      return record.cityText;
    } else if (!record.cityText) {
      return record.provinceText;
    } else {
      return null;
    }
  }
  getColumns = () => {
    const {
        dic_sex,
        dic_customer_level,
        dic_yes_or_no,
        dic_customer_status,
        dic_customer_buy_type
      } = this.state.filters,
      columns = [
        {
          title: "客户名称",
          dataIndex: "name",
          width: 120,
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
                  this.editCustomerFloat.show(record);
                }}
              >
                {record.name}
              </a>
            );
          }
        },
        {
          title: "客户编号",
          dataIndex: "number",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="number" mod={this} />
            </div>
          )
        },
        {
          title: "客户类型",
          dataIndex: "customerType",
          filters: dic_customer_buy_type,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="customerType" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.customerTypeText;
          }
        },
        {
          title: "联系方式",
          dataIndex: "mobile",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter
                filterKey="mobile"
                mod={this}
                placeholder="请输入正确手机号"
              />
            </div>
          )
        },
        {
          title: "地域",
          dataIndex: "cityCodes",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCitysFilter filterKey="cityCodes" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return this.getAreaText(record);
          }
        },
        {
          title: "重要级别",
          dataIndex: "levels",
          width: 120,
          sorter: true,
          filters: dic_customer_level,
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
          title: "是否成交",
          dataIndex: "isDeals",
          width: 100,
          filters: dic_yes_or_no,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="isDeals" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.isDealText;
          }
        },
        {
          title: "负责人",
          dataIndex: "fpName",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="fpName" mod={this} />
            </div>
          )
        },
        {
          title: "负责人所在部门",
          dataIndex: "department",
          width: 150,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="department" mod={this} />
            </div>
          )
        },
        {
          title: "有效性",
          dataIndex: "statuss",
          filters: dic_customer_status,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="statuss" mod={this} />
            </div>
          ),
          render(text, record) {
            return record.statusText;
          }
        },
        {
          title: "最近成交日期",
          dataIndex: "dealDate",
          width: 130,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="dealDate" mod={this} />
              <GridDateFilter filterKey="dealDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "最近跟进日期",
          dataIndex: "followDate",
          width: 130,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="followDate" mod={this} />
              <GridDateFilter filterKey="followDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "分配日期",
          dataIndex: "distributionDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="distributionDate" mod={this} />
              <GridDateFilter filterKey="distributionDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
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
          title: "操作",
          width: 60,
          fixed: "right",
          render: (text, record) => {
            return record.canFollow ? (
              <a onClick={() => this.showModal("customerFollowModal", record)}>
                跟进
              </a>
            ) : (
              <Popover
                placement="topRight"
                content={record.tipsForDisabledFollow}
                arrowPointAtCenter
              >
                <span className="disabled">跟进</span>
              </Popover>
            );
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "customerType");
    this.resetFilterByKey(params, "fpName");
    this.resetFilterByKey(params, "department");
    this.resetFilterByKey(params, "sexs");
    this.resetFilterByKey(params, "cityCodes");
    this.resetFilterByKey(params, "levels");
    this.resetFilterByKey(params, "isDeals");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "dealDate");
    this.resetFilterByKey(params, "distributionDate");
    this.resetFilterByKey(params, "followDate");
    this.resetFilterByKey(params, "createDate");

    this.resetFilterByKey(params, "tags");
    this.resetFilterByKey(params, "investTypes");
    this.resetFilterByKey(params, "riskRatings");
    this.resetFilterByKey(params, "typies");
    this.resetFilterByKey(params, "birthday");

    if (params.cityCodes && params.cityCodes.length) {
      params.cityCodes = params.cityCodes.join(",");
    }

    if (params.dealDate && params.dealDate.length) {
      params.dealDateBegin = params.dealDate[0];
      params.dealDateEnd = params.dealDate[1];
      delete params.dealDate;
    }
    if (params.distributionDate && params.distributionDate.length) {
      params.distributionDateBegin = params.distributionDate[0];
      params.distributionDateEnd = params.distributionDate[1];
      delete params.distributionDate;
    }
    if (params.followDate && params.followDate.length) {
      params.followDateBegin = params.followDate[0];
      params.followDateEnd = params.followDate[1];
      delete params.followDate;
    }
    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }
    if (params.birthday && params.birthday.length) {
      params.birthdayBegin = params.birthday[0];
      params.birthdayEnd = params.birthday[1];
      delete params.birthday;
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
          params[key][0] &&
          params[key][0].filterType === "dateRange"
        ) {
          params[key] = params[key][0].values;
        } else if (key === "birthday") {
          params[key] = params[key][0].values.splice(2);
        } else if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "citys"
        ) {
          params[key] = params[key][0].values.value;
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
  /**
   * 关注
   *
   * @returns
   * @memberof CustomerIndex
   */
  handleFollow = () => {
    let { selectIds: customerIds } = this.state,
      _this = this;
    this.customer.focus(customerIds).then(res => {
      if (res.success) {
        Modal.success({
          title: "关注客户成功",
          content: "可在左上角筛选项中选择查看全部关注的客户。",
          okText: "确定"
        });

        _this.gridManager.clearRowSelect();
      }
    });
  };
  /**
   * 调配
   *
   * @returns
   * @memberof CustomerPool
   */
  handleModal = modal => {
    let { selectRowsData } = this.state,
      customerIds = [],
      customerNames = [];

    selectRowsData.map(item => {
      customerIds.push(item.id);
      customerNames.push(item.name);
    });

    let data = {
      customerIds: customerIds.join(","),
      customerNames: customerNames.join("、")
    };
    this[modal].show(data);
  };
  /**
   * 回退
   *
   * @memberof CustomerIndex
   */
  handleGoback = () => {
    const _this = this;
    let { selectRowsData, selectIds } = this.state;

    this.customer
      .back({ customerIds: selectIds.join(","), reason: "try submit" })
      .then(res => {
        const { failList = [], passList = [] } = res.result || {};

        let messageContent = [],
          messages = {};

        let customerIds = [],
          customerNames = [];

        if (failList && failList.length > 0) {
          passList.map(item => {
            customerIds.push(item.id);
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

          if (customerIds.length > 0) {
            Modal.confirm({
              width: 460,
              title: `您选择的客户中，以下${failList.length}个客户无法放弃：`,
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
                    是否继续放弃其他选中客户？
                  </p>
                </div>
              ),
              onOk() {
                selectRowsData.map(item => {
                  if (customerIds.indexOf(item.id) > -1) {
                    customerIds.push(item.id);
                    customerNames.push(`${item.name}(${item.mobile})`);
                  }
                });

                _this.showModal("customerBackModal", {
                  customerIds: customerIds.join(","),
                  customerNames: customerNames.join("、")
                });
              }
            });
          } else {
            //错误同一个原因时
            if (messageContent.length === 1) {
              messageContent = <p>{failList[0].message}</p>;
            }

            Modal.info({
              title: "您选择的客户无法放弃：",
              content: <div style={{ paddingTop: 15 }}>{messageContent}</div>,
              okText: "确定"
            });
          }
        } else if (failList && failList.length === 0) {
          selectRowsData.map(item => {
            customerIds.push(item.id);
            customerNames.push(`${item.name}(${item.mobile})`);
          });

          _this.showModal("customerBackModal", {
            customerIds: customerIds.join(","),
            customerNames: customerNames.join("、")
          });
        }
      });
  };
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
  render() {
    const hasAdd = Utils.checkPermission("customer.v2.add");
    const hasImport = Utils.checkPermission("customer.v2.import.multi");

    const PermissionButton = ((hasAdd, hasImport) => {
      if (hasAdd) {
        if (hasImport) {
          return (
            <div className={style.import_btn}>
              <Dropdown.Button
                overlay={
                  <div className={style.import}>
                    <Menu
                      onClick={(item, key, selectedKeys) => {
                        this.importCustomerModal.show({
                          request: "/api/customer/v2/import/multi"
                        });
                      }}
                    >
                      <Menu.Item key="import_customer">
                        <span>导入客户</span>
                      </Menu.Item>
                    </Menu>
                  </div>
                }
                onClick={() => {
                  this.editCustomerModal.show();
                }}
              >
                <img src={"/assets/images/icon/新增@2x.png"} alt="" />
                新增客户
              </Dropdown.Button>
            </div>
          );
        } else {
          return (
            <div className={style.import_btn}>
              <Button
                onClick={() => {
                  this.editCustomerModal.show();
                }}
              >
                <img src={"/assets/images/icon/新增@2x.png"} alt="" />
                新增客户
              </Button>
            </div>
          );
        }
      } else if (hasImport) {
        return (
          <div className={style.import_btn}>
            <Button
              onClick={() => {
                this.importCustomerModal.show({
                  request: "/api/customer/v2/import/multi"
                });
              }}
            >
              <img src={"/assets/images/icon/新增@2x.png"} alt="" />
              导入客户
            </Button>
          </div>
        );
      }
      return null;
    })(hasAdd, hasImport);

    const PermissionGoback = Permission(
      <span>
        <span className="separator">|</span>
        <a className="ant-btn-link" onClick={this.handleGoback}>
          <Icon type="rollback" />放弃
        </a>
      </span>
    );

    const PermissionAllotFp = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("customerDeployModal")}
        >
          <img src={icon_deploy + "@1x.png"} />调配
        </a>
      </span>
    );

    const PermissionRecycle = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("customerRecoverModal")}
        >
          <img src={icon_allot + "@1x.png"} />回收
        </a>
      </span>
    );
    const PermissionFocus = Permission(
      <span>
        <span className="separator">|</span>
        <a className="ant-btn-link" onClick={this.handleFollow}>
          <Icon type="heart-o" />关注
        </a>
      </span>
    );

    const PermissionAllotCs = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("customerAllotModal")}
        >
          <img src={icon_reconver + "@1x.png"} />分配回访
        </a>
      </span>
    );

    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>客户</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/customer/v2/get_page"
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
                      <Menu.Item key="my">我负责的客户</Menu.Item>
                      <Menu.Item key="neverfollow">未跟进的客户</Menu.Item>
                      <Menu.Item key="focus">我关注的客户</Menu.Item>
                      <Menu.Item key="department">我部门的客户</Menu.Item>
                      <Menu.Item key="all">全部客户</Menu.Item>
                    </Menu>
                  }
                >
                  <a className={`ant-dropdown-link ${style.title}`}>
                    {menuName.text}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </div>
              <div className="vant-filter-bar-action fr">
                {PermissionButton}
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
                <PermissionAllotFp auth="customer.v2.distribution.allot_to_fp" />
                <PermissionGoback auth="customer.v2.back.apply" />
                <PermissionFocus auth="user.customer.v2.focus" />
                <PermissionRecycle auth="customer.v2.distribution.recycle" />
                <PermissionAllotCs auth="customer.v2.distribution.allot_to_cs" />
              </div>
            </div>
            <FilterBar gridManager={this.gridManager} ref="filterBar">
              <FilterCustomerForm grid={this.gridManager} />
            </FilterBar>
          </GridManager>
          <CustomerFollowModal
            ref="customerFollowModal"
            reload={() => {
              this.editCustomerFloat.handleCallback();
            }}
          />
          <CustomerBackModal ref="customerBackModal" reload={this.reload} />
          <CustomerDeployModal
            reload={this.reload}
            ref={ref => (this.customerDeployModal = ref)}
          />
          <CustomerRecoverModal
            reload={this.reload}
            ref={ref => (this.customerRecoverModal = ref)}
          />
          <CustomerAllotModal
            reload={this.reload}
            ref={ref => (this.customerAllotModal = ref)}
          />
          <EditCustomerModal
            reload={this.reload}
            ref={ref => (this.editCustomerModal = ref)}
          />
          <ImportCustomerModal
            callback={this.reload}
            ref={ref => (this.importCustomerModal = ref)}
          />
        </div>
        <CustomerDetailFloat
          reload={this.reload}
          ref={ref => (this.editCustomerFloat = ref)}
        />
      </Page>
    );
  }
}
